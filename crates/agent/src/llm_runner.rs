//! LLM step execution helper for agent runtime.

use std::sync::Arc;
use std::time::Instant;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_domain::entities::agent::Agent;
use hubbub_domain::entities::run::{Step, StepKind, StepStatus};
use hubbub_domain::events::RunEvent;
use hubbub_domain::ports::event_sink::EventSink;
use hubbub_domain::ports::llm::{
    LlmChunk, LlmConfig, LlmMessage, LlmProvider, ToolCall, ToolSchema,
};
use hubbub_domain::ports::store::Store;

use crate::budget::BudgetTracker;
use crate::errors::AgentError;

pub struct LlmStepParams<'a> {
    pub run_id: Uuid,
    pub agent: &'a Agent,
    pub working_messages: &'a [LlmMessage],
    pub active_tools: &'a [ToolSchema],
    pub step_idx: u32,
    pub cancellation_token: &'a CancellationToken,
}

pub struct LlmRunner<'a> {
    pub store: &'a Arc<dyn Store>,
    pub llm_provider: &'a Arc<dyn LlmProvider>,
    pub event_sink: &'a Arc<dyn EventSink>,
}

impl<'a> LlmRunner<'a> {
    pub async fn run_step(
        &self,
        params: LlmStepParams<'_>,
        budget: &mut BudgetTracker,
    ) -> Result<(String, Vec<ToolCall>, u64, u64), AgentError> {
        let step_id = Uuid::now_v7();
        let step_start = Instant::now();
        let mut step = Step {
            id: step_id,
            run_id: params.run_id,
            idx: params.step_idx,
            kind: StepKind::Llm,
            input: serde_json::json!({
                "model": &params.agent.model,
                "messages_count": params.working_messages.len(),
            }),
            output: None,
            status: StepStatus::Running,
            duration_ms: None,
            created_at: chrono::Utc::now(),
        };
        self.store.create_step(&step).await?;

        let llm_config = LlmConfig {
            model: params.agent.model.clone(),
            max_tokens: Some(params.agent.budget.max_tokens),
            temperature: Some(0.7),
        };

        let stream_result = tokio::select! {
            _ = params.cancellation_token.cancelled() => {
                return Err(AgentError::Cancelled);
            }
            res = self.llm_provider.chat_stream(
                params.working_messages.to_vec(),
                params.active_tools.to_vec(),
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

        let mut text = String::new();
        let mut tool_calls: Vec<ToolCall> = Vec::new();
        let mut p_tokens = 0u64;
        let mut c_tokens = 0u64;

        loop {
            let chunk_opt = tokio::select! {
                _ = params.cancellation_token.cancelled() => {
                    return Err(AgentError::Cancelled);
                }
                chunk = stream.next() => chunk
            };

            match chunk_opt {
                Some(Ok(LlmChunk::Delta(delta))) => {
                    text.push_str(&delta);
                    self.event_sink
                        .emit(RunEvent::MessageDelta { content: delta })
                        .await?;
                }
                Some(Ok(LlmChunk::ToolCall(tc))) => {
                    tool_calls.push(tc);
                }
                Some(Ok(LlmChunk::Usage(usage))) => {
                    p_tokens += usage.prompt_tokens;
                    c_tokens += usage.completion_tokens;
                    budget.record_usage(&usage)?;
                }
                Some(Ok(LlmChunk::Done)) | None => break,
                Some(Err(e)) => return Err(AgentError::Domain(e)),
            }
        }

        step.status = StepStatus::Completed;
        step.duration_ms = Some(step_start.elapsed().as_millis() as u64);
        step.output = Some(serde_json::json!({
            "text_length": text.len(),
            "tool_calls_count": tool_calls.len(),
        }));
        let _ = self.store.create_step(&step).await;

        Ok((text, tool_calls, p_tokens, c_tokens))
    }
}
