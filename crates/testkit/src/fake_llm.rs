use async_trait::async_trait;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::{
    LlmChunk, LlmConfig, LlmMessage, LlmProvider, LlmStream, LlmUsage, ToolCall, ToolSchema,
};
use std::collections::VecDeque;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

#[derive(Debug, Clone)]
pub struct FakeResponse {
    pub chunks: Vec<Result<LlmChunk, DomainError>>,
    pub chunk_delay: Option<Duration>,
}

#[derive(Debug, Clone)]
pub struct RecordedCall {
    pub messages: Vec<LlmMessage>,
    pub tools: Vec<ToolSchema>,
    pub config: LlmConfig,
}

pub struct FakeLlm {
    responses: Arc<Mutex<VecDeque<FakeResponse>>>,
    recorded_calls: Arc<Mutex<Vec<RecordedCall>>>,
}

impl Default for FakeLlm {
    fn default() -> Self {
        Self::new()
    }
}

impl FakeLlm {
    pub fn new() -> Self {
        Self {
            responses: Arc::new(Mutex::new(VecDeque::new())),
            recorded_calls: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Helper to create a FakeLlm with a single text response.
    pub async fn with_text_response(text: &str) -> Self {
        let fake = Self::new();
        fake.push_response(FakeResponse {
            chunks: vec![Ok(LlmChunk::Delta(text.to_string())), Ok(LlmChunk::Done)],
            chunk_delay: None,
        })
        .await;
        fake
    }

    /// Add a scripted response to the queue.
    pub async fn push_response(&self, response: FakeResponse) {
        let mut lock = self.responses.lock().await;
        lock.push_back(response);
    }

    /// Helper to add a response yielding multiple text deltas.
    pub async fn push_text_deltas(&self, deltas: &[&str], usage: Option<LlmUsage>) {
        let mut chunks: Vec<Result<LlmChunk, DomainError>> = deltas
            .iter()
            .map(|&d| Ok(LlmChunk::Delta(d.to_string())))
            .collect();

        if let Some(u) = usage {
            chunks.push(Ok(LlmChunk::Usage(u)));
        }
        chunks.push(Ok(LlmChunk::Done));

        self.push_response(FakeResponse {
            chunks,
            chunk_delay: None,
        })
        .await;
    }

    /// Helper to add a response yielding a tool call.
    pub async fn push_tool_call(&self, id: &str, name: &str, arguments: &str) {
        self.push_response(FakeResponse {
            chunks: vec![
                Ok(LlmChunk::ToolCall(ToolCall {
                    id: id.to_string(),
                    name: name.to_string(),
                    arguments: arguments.to_string(),
                })),
                Ok(LlmChunk::Done),
            ],
            chunk_delay: None,
        })
        .await;
    }

    /// Get all recorded calls made to this FakeLlm.
    pub async fn get_recorded_calls(&self) -> Vec<RecordedCall> {
        let lock = self.recorded_calls.lock().await;
        lock.clone()
    }
}

#[async_trait]
impl LlmProvider for FakeLlm {
    async fn chat_stream(
        &self,
        messages: Vec<LlmMessage>,
        tools: Vec<ToolSchema>,
        config: LlmConfig,
    ) -> Result<Box<dyn LlmStream>, DomainError> {
        {
            let mut calls = self.recorded_calls.lock().await;
            calls.push(RecordedCall {
                messages,
                tools,
                config,
            });
        }

        let mut responses = self.responses.lock().await;
        let response = responses.pop_front().unwrap_or(FakeResponse {
            chunks: vec![Ok(LlmChunk::Done)],
            chunk_delay: None,
        });

        Ok(Box::new(FakeStream {
            chunks: VecDeque::from(response.chunks),
            delay: response.chunk_delay,
        }))
    }
}

struct FakeStream {
    chunks: VecDeque<Result<LlmChunk, DomainError>>,
    delay: Option<Duration>,
}

#[async_trait]
impl LlmStream for FakeStream {
    async fn next(&mut self) -> Option<Result<LlmChunk, DomainError>> {
        if let Some(d) = self.delay {
            tokio::time::sleep(d).await;
        }
        self.chunks.pop_front()
    }
}
