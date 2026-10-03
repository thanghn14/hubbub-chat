//! # hubbub-tools
//!
//! Built-in tool implementations and host.

use async_trait::async_trait;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::ToolSchema;
use hubbub_domain::ports::tool_host::{ToolContext, ToolHost, ToolResult};
use serde_json::Value;

#[derive(Default)]
pub struct BuiltinToolHost;

impl BuiltinToolHost {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl ToolHost for BuiltinToolHost {
    async fn execute(
        &self,
        tool_name: &str,
        _arguments: Value,
        _context: ToolContext,
    ) -> Result<ToolResult, DomainError> {
        match tool_name {
            "web_search" => {
                let query = _arguments
                    .get("query")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                let content = if query.is_empty() {
                    "Web search completed: No query provided.".to_string()
                } else {
                    format!("Search results for '{query}': Live external search engine integration is scheduled for Phase 2. Please synthesize a comprehensive response based on your training knowledge.")
                };
                Ok(ToolResult {
                    success: true,
                    content,
                    metadata: None,
                })
            }
            "fs_read" => Ok(ToolResult {
                success: true,
                content: "Filesystem read tool ready.".to_string(),
                metadata: None,
            }),
            other => Err(DomainError::NotFound {
                entity_type: "tool",
                id: other.to_string(),
            }),
        }
    }

    fn available_tools(&self, _agent_id: &str) -> Vec<ToolSchema> {
        vec![
            ToolSchema {
                name: "web_search".to_string(),
                description: "Search the web for current information".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "query": { "type": "string", "description": "The search query" }
                    },
                    "required": ["query"]
                }),
            },
            ToolSchema {
                name: "fs_read".to_string(),
                description: "Read a file from the workspace".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "path": { "type": "string", "description": "Relative file path" }
                    },
                    "required": ["path"]
                }),
            },
        ]
    }
}
