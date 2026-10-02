//! Tool execution helper for agent runtime.

use serde_json::Value;
use std::sync::Arc;
use std::time::Instant;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_domain::entities::agent::Agent;
use hubbub_domain::entities::conversation::{Message, MessagePart, MessageRole};
use hubbub_domain::entities::run::{Step, StepKind, StepStatus};
use hubbub_domain::events::RunEvent;
use hubbub_domain::ports::event_sink::EventSink;
use hubbub_domain::ports::llm::{LlmMessage, ToolCall};
use hubbub_domain::ports::store::Store;
use hubbub_domain::ports::tool_host::{ToolContext, ToolHost};

use crate::errors::AgentError;

pub struct ToolRunner<'a> {
    pub store: &'a Arc<dyn Store>,
    pub tool_host: &'a Arc<dyn ToolHost>,
    pub event_sink: &'a Arc<dyn EventSink>,
    pub workspace_root: &'a str,
}

impl<'a> ToolRunner<'a> {
    pub async fn execute_tool_call(
        &self,
        run_id: Uuid,
        conversation_id: Uuid,
        agent: &Agent,
        tc: &ToolCall,
        step_idx: u32,
        cancellation_token: &CancellationToken,
    ) -> Result<LlmMessage, AgentError> {
        let tool_step_start = Instant::now();
        let args_val: Value =
            serde_json::from_str(&tc.arguments).unwrap_or(Value::String(tc.arguments.clone()));

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
            created_at: chrono::Utc::now(),
        };
        self.store.create_step(&tool_step).await?;

        let tool_context = ToolContext {
            agent_id: agent.id.clone(),
            run_id,
            workspace_root: self.workspace_root.to_string(),
        };

        let tool_exec_res = tokio::select! {
            _ = cancellation_token.cancelled() => {
                return Err(AgentError::Cancelled);
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

        let tool_msg = Message {
            id: Uuid::now_v7(),
            conversation_id,
            run_id: Some(run_id),
            role: MessageRole::Tool,
            parts: vec![MessagePart::ToolResult {
                tool_call_id: tc.id.clone(),
                result: Value::String(tool_result_content.clone()),
            }],
            created_at: chrono::Utc::now(),
        };
        self.store.append_message(&tool_msg).await?;

        Ok(LlmMessage {
            role: "tool".to_string(),
            content: tool_result_content,
            tool_calls: None,
            tool_call_id: Some(tc.id.clone()),
        })
    }
}
