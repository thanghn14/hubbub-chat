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

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LlmChunk {
    Delta(String),
    ToolCall(ToolCall),
    Usage(LlmUsage),
    FinishReason(String),
    Done,
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ToolCall {
    pub id: String,
    pub name: String,
    pub arguments: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extra_content: Option<serde_json::Value>,
}

impl ToolCall {
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        arguments: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            arguments: arguments.into(),
            extra_content: None,
        }
    }

    pub fn with_extra_content(mut self, extra: Option<serde_json::Value>) -> Self {
        self.extra_content = extra;
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LlmUsage {
    pub prompt_tokens: u64,
    pub completion_tokens: u64,
}
