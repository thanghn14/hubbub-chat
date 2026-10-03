use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A conversation between the user and an agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: Uuid,
    pub title: String,
    pub agent_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub archived: bool,
}

/// A single message in a conversation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub run_id: Option<Uuid>,
    pub role: MessageRole,
    pub parts: Vec<MessagePart>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MessageRole {
    User,
    Assistant,
    System,
    Tool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "content")]
pub enum MessagePart {
    Text(String),
    ToolCall {
        id: String,
        name: String,
        arguments: serde_json::Value,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        extra_content: Option<serde_json::Value>,
    },
    ToolResult {
        tool_call_id: String,
        result: serde_json::Value,
    },
    FileRef {
        path: String,
        title: Option<String>,
    },
}
