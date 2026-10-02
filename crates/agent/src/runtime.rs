use chrono::Utc;
use serde_json::Value;
use std::sync::Arc;
use std::time::Instant;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_domain::entities::agent::Agent;
use hubbub_domain::entities::conversation::{Conversation, Message, MessagePart, MessageRole};
use hubbub_domain::entities::run::{Run, RunStatus, Step, StepKind, StepStatus, UsageInfo};
use hubbub_domain::events::RunEvent;
use hubbub_domain::ports::event_sink::EventSink;
use hubbub_domain::ports::llm::{
    LlmChunk, LlmConfig, LlmMessage, LlmProvider, ToolCall, ToolSchema,
};
use hubbub_domain::ports::store::Store;
use hubbub_domain::ports::tool_host::{ToolContext, ToolHost};

use crate::budget::BudgetTracker;
use crate::context::ContextBuilder;
use crate::errors::AgentError;

pub struct AgentRuntime {
    store: Arc<dyn Store>,
    llm_provider: Arc<dyn LlmProvider>,
    tool_host: Arc<dyn ToolHost>,
    event_sink: Arc<dyn EventSink>,
    workspace_root: String,
}

impl AgentRuntime {
    pub fn new(
        store: Arc<dyn Store>,
        llm_provider: Arc<dyn LlmProvider>,
        tool_host: Arc<dyn ToolHost>,
        event_sink: Arc<dyn EventSink>,
        workspace_root: Option<String>,
    ) -> Self {
        Self {
            store,
            llm_provider,
            tool_host,
            event_sink,
            workspace_root: workspace_root.unwrap_or_else(|| ".".to_string()),
        }
    }

    /// Execute an agent run within a conversation.
    pub async fn execute_run(
        &self,
        conversation_id: Uuid,
        agent: &Agent,
        user_prompt: Option<&str>,
        cancellation_token: CancellationToken,
    ) -> Result<Run, AgentError> {
        // 1. Ensure conversation exists
        let conv_opt = self.store.get_conversation(conversation_id).await?;
        if conv_opt.is_none() {
            let new_conv = Conversation {
                id: conversation_id,
                title: user_prompt.unwrap_or("New Conversation").to_string(),
                agent_id: agent.id.clone(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
                archived: false,
            };
            self.store.create_conversation(&new_conv).await?;
        }

        // 2. Append user message if provided
        if let Some(prompt) = user_prompt.filter(|p| !p.is_empty()) {
            let user_msg = Message {
                id: Uuid::now_v7(),
                conversation_id,
                run_id: None,
                role: MessageRole::User,
                parts: vec![MessagePart::Text(prompt.to_string())],
                created_at: Utc::now(),
            };
            self.store.append_message(&user_msg).await?;
        }

        // 3. Create Run record
        let run_id = Uuid::now_v7();
        let mut run = Run {
            id: run_id,
            conversation_id,
            agent_id: agent.id.clone(),
            parent_run_id: None,
            status: RunStatus::Running,
            usage: None,
            cost_usd: None,
            started_at: Utc::now(),
            finished_at: None,
        };
        self.store.create_run(&run).await?;

        // 4. Load history and build initial prompt context
        let history = self.store.list_messages(conversation_id, 1000, 0).await?;
        let mut working_messages = ContextBuilder::build(agent, &history, None);

        // 5. Gather permitted tools
        let all_tools = self.tool_host.available_tools(&agent.id);
        let active_tools: Vec<ToolSchema> = all_tools
            .into_iter()
            .filter(|t| agent.tools.builtin.contains(&t.name) || agent.tools.mcp.contains(&t.name))
            .collect();

        // 6. Initialize budget & token accumulators
        let mut budget = BudgetTracker::new(agent.budget.clone());
        let mut total_prompt_tokens = 0u64;
        let mut total_completion_tokens = 0u64;
        let mut step_idx = 0u32;

        // 7. Core execution loop
        loop {
            // Check cancellation
            if cancellation_token.is_cancelled() {
                return self.handle_cancelled(&mut run).await;
            }

            // Check budget
            if let Err(e) = budget.check_limits() {
                return self.handle_budget_exceeded(&mut run, e).await;
            }

            // Record step in budget
            budget.record_step()?;
            step_idx += 1;

            // Record LLM Step (Running)
            let step_id = Uuid::now_v7();
            let step_start = Instant::now();
            let mut step = Step {
                id: step_id,
                run_id,
                idx: step_idx,
                kind: StepKind::Llm,
                input: serde_json::json!({
                    "model": &agent.model,
                    "messages_count": working_messages.len(),
                }),
                output: None,
                status: StepStatus::Running,
                duration_ms: None,
                created_at: Utc::now(),
            };
            self.store.create_step(&step).await?;

            let llm_config = LlmConfig {
                model: agent.model.clone(),
                max_tokens: Some(agent.budget.max_tokens),
                temperature: Some(0.7),
            };

            // Call LLM stream with cancellation support
            let stream_result = tokio::select! {
                _ = cancellation_token.cancelled() => {
                    return self.handle_cancelled(&mut run).await;
                }
                res = self.llm_provider.chat_stream(
                    working_messages.clone(),
                    active_tools.clone(),
                    llm_config,
                ) => res
            };

            let mut stream = match stream_result {
                Ok(s) => s,
                Err(e) => {
                    step.status = StepStatus::Failed;
                    step.duration_ms = Some(step_start.elapsed().as_millis() as u64);
                    step.output = Some(serde_json::json!({ "error": e.to_string() }));
                    let _ = self.store.create_step(&step).await;

                    run.status = RunStatus::Failed;
                    run.finished_at = Some(Utc::now());
                    self.store.update_run(&run).await?;

                    let _ = self
                        .event_sink
                        .emit(RunEvent::Error {
                            message: e.to_string(),
                            recoverable: false,
                        })
                        .await;

                    return Err(AgentError::Domain(e));
                }
            };

            // Stream response chunks
            let mut assistant_text = String::new();
            let mut assistant_tool_calls: Vec<ToolCall> = Vec::new();

            loop {
                let chunk_opt = tokio::select! {
                    _ = cancellation_token.cancelled() => {
                        return self.handle_cancelled(&mut run).await;
                    }
                    chunk = stream.next() => chunk
                };

                match chunk_opt {
                    Some(Ok(LlmChunk::Delta(delta))) => {
                        assistant_text.push_str(&delta);
                        self.event_sink
                            .emit(RunEvent::MessageDelta { content: delta })
                            .await?;
                    }
                    Some(Ok(LlmChunk::ToolCall(tc))) => {
                        assistant_tool_calls.push(tc);
                    }
                    Some(Ok(LlmChunk::Usage(usage))) => {
                        total_prompt_tokens += usage.prompt_tokens;
                        total_completion_tokens += usage.completion_tokens;
                        if let Err(e) = budget.record_usage(&usage) {
                            return self.handle_budget_exceeded(&mut run, e).await;
                        }
                    }
                    Some(Ok(LlmChunk::Done)) => break,
                    Some(Err(e)) => {
                        return Err(AgentError::Domain(e));
                    }
                    None => break,
                }
            }

            // Complete LLM Step
            step.status = StepStatus::Completed;
            step.duration_ms = Some(step_start.elapsed().as_millis() as u64);
            step.output = Some(serde_json::json!({
                "text_length": assistant_text.len(),
                "tool_calls_count": assistant_tool_calls.len(),
            }));
            let _ = self.store.create_step(&step).await;

            // Case A: No tool calls -> final response
            if assistant_tool_calls.is_empty() {
                // Save assistant message to store
                let assistant_msg = Message {
                    id: Uuid::now_v7(),
                    conversation_id,
                    run_id: Some(run_id),
                    role: MessageRole::Assistant,
                    parts: vec![MessagePart::Text(assistant_text)],
                    created_at: Utc::now(),
                };
                self.store.append_message(&assistant_msg).await?;

                // Complete run
                run.status = RunStatus::Completed;
                run.finished_at = Some(Utc::now());
                run.usage = Some(UsageInfo {
                    prompt_tokens: total_prompt_tokens,
                    completion_tokens: total_completion_tokens,
                    total_tokens: total_prompt_tokens + total_completion_tokens,
                });
                self.store.update_run(&run).await?;

                self.event_sink
                    .emit(RunEvent::RunFinished {
                        run_id: run_id.to_string(),
                        status: "completed".to_string(),
                    })
                    .await?;

                return Ok(run);
            }

            // Case B: Tool calls present -> execute tools and loop
            let mut parts = Vec::new();
            if !assistant_text.is_empty() {
                parts.push(MessagePart::Text(assistant_text.clone()));
            }
            for tc in &assistant_tool_calls {
                let parsed_args = serde_json::from_str(&tc.arguments)
                    .unwrap_or(Value::String(tc.arguments.clone()));
                parts.push(MessagePart::ToolCall {
                    id: tc.id.clone(),
                    name: tc.name.clone(),
                    arguments: parsed_args,
                });
            }

            // Save assistant message with tool calls
            let assistant_msg = Message {
                id: Uuid::now_v7(),
                conversation_id,
                run_id: Some(run_id),
                role: MessageRole::Assistant,
                parts,
                created_at: Utc::now(),
            };
            self.store.append_message(&assistant_msg).await?;

            // Append assistant message to working context
            working_messages.push(LlmMessage {
                role: "assistant".to_string(),
                content: assistant_text,
                tool_calls: Some(assistant_tool_calls.clone()),
                tool_call_id: None,
            });

            // Execute each tool call
            for tc in &assistant_tool_calls {
                if cancellation_token.is_cancelled() {
                    return self.handle_cancelled(&mut run).await;
                }

                step_idx += 1;
                let tool_step_start = Instant::now();
                let args_val: Value = serde_json::from_str(&tc.arguments)
                    .unwrap_or(Value::String(tc.arguments.clone()));

                let preview = if tc.arguments.len() > 100 {
                    format!("{}...", &tc.arguments[..100])
                } else {
                    tc.arguments.clone()
                };

                self.event_sink
                    .emit(RunEvent::ToolStarted {
                        tool_name: tc.name.clone(),
                        args_preview: preview,
                    })
                    .await?;

                let mut tool_step = Step {
                    id: Uuid::now_v7(),
                    run_id,
                    idx: step_idx,
                    kind: StepKind::Tool,
                    input: args_val.clone(),
                    output: None,
                    status: StepStatus::Running,
                    duration_ms: None,
                    created_at: Utc::now(),
                };
                self.store.create_step(&tool_step).await?;

                let tool_context = ToolContext {
                    agent_id: agent.id.clone(),
                    run_id,
                    workspace_root: self.workspace_root.clone(),
                };

                // Execute tool with cancellation
                let tool_exec_res = tokio::select! {
                    _ = cancellation_token.cancelled() => {
                        return self.handle_cancelled(&mut run).await;
                    }
                    res = self.tool_host.execute(&tc.name, args_val, tool_context) => res
                };

                let (tool_result_content, success) = match tool_exec_res {
                    Ok(res) => (res.content, res.success),
                    Err(e) => (format!("Tool execution error: {e}"), false),
                };

                tool_step.status = if success {
                    StepStatus::Completed
                } else {
                    StepStatus::Failed
                };
                tool_step.duration_ms = Some(tool_step_start.elapsed().as_millis() as u64);
                tool_step.output = Some(Value::String(tool_result_content.clone()));
                let _ = self.store.create_step(&tool_step).await;

                let summary = if tool_result_content.len() > 100 {
                    format!("{}...", &tool_result_content[..100])
                } else {
                    tool_result_content.clone()
                };

                self.event_sink
                    .emit(RunEvent::ToolFinished {
                        tool_name: tc.name.clone(),
                        success,
                        summary,
                    })
                    .await?;

                // Append tool result message to store
                let tool_msg = Message {
                    id: Uuid::now_v7(),
                    conversation_id,
                    run_id: Some(run_id),
                    role: MessageRole::Tool,
                    parts: vec![MessagePart::ToolResult {
                        tool_call_id: tc.id.clone(),
                        result: Value::String(tool_result_content.clone()),
                    }],
                    created_at: Utc::now(),
                };
                self.store.append_message(&tool_msg).await?;

                // Append tool message to working context
                working_messages.push(LlmMessage {
                    role: "tool".to_string(),
                    content: tool_result_content,
                    tool_calls: None,
                    tool_call_id: Some(tc.id.clone()),
                });
            }
        }
    }

    async fn handle_cancelled(&self, run: &mut Run) -> Result<Run, AgentError> {
        run.status = RunStatus::Cancelled;
        run.finished_at = Some(Utc::now());
        let _ = self.store.update_run(run).await;

        let _ = self
            .event_sink
            .emit(RunEvent::RunFinished {
                run_id: run.id.to_string(),
                status: "cancelled".to_string(),
            })
            .await;

        Err(AgentError::Cancelled)
    }

    async fn handle_budget_exceeded(
        &self,
        run: &mut Run,
        err: AgentError,
    ) -> Result<Run, AgentError> {
        run.status = RunStatus::Failed;
        run.finished_at = Some(Utc::now());
        let _ = self.store.update_run(run).await;

        let _ = self
            .event_sink
            .emit(RunEvent::Error {
                message: err.to_string(),
                recoverable: false,
            })
            .await;

        let _ = self
            .event_sink
            .emit(RunEvent::RunFinished {
                run_id: run.id.to_string(),
                status: "failed".to_string(),
            })
            .await;

        Err(err)
    }
}
