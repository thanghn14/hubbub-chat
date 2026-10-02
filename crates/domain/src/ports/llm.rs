use async_trait::async_trait;

use crate::errors::DomainError;

/// Port for LLM provider interactions.
#[async_trait]
pub trait LlmProvider: Send + Sync {
    /// Send a chat completion request, streaming response chunks.
    async fn chat_stream(
        &self,
        messages: Vec<LlmMessage>,
        tools: Vec<ToolSchema>,
        config: LlmConfig,
    ) -> Result<Box<dyn LlmStream>, DomainError>;
}

/// A streaming response from an LLM.
#[async_trait]
pub trait LlmStream: Send {
    /// Get the next chunk from the stream. Returns None when complete.
    async fn next(&mut self) -> Option<Result<LlmChunk, DomainError>>;
}

#[derive(Debug, Clone)]
pub struct LlmMessage {
    pub role: String,
    pub content: String,
    pub tool_calls: Option<Vec<ToolCall>>,
    pub tool_call_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ToolSchema {
    pub name: String,
    pub description: String,
    pub parameters: serde_json::Value,
}

#[derive(Debug, Clone)]
pub struct LlmConfig {
    pub model: String,
    pub max_tokens: Option<u64>,
    pub temperature: Option<f64>,
}

#[derive(Debug, Clone)]
pub enum LlmChunk {
    Delta(String),
    ToolCall(ToolCall),
    Usage(LlmUsage),
    Done,
}

#[derive(Debug, Clone)]
pub struct ToolCall {
    pub id: String,
    pub name: String,
    pub arguments: String,
}

#[derive(Debug, Clone)]
pub struct LlmUsage {
    pub prompt_tokens: u64,
    pub completion_tokens: u64,
}
