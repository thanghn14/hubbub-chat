use crate::errors::DomainError;
use async_trait::async_trait;

/// Port for tool execution.
#[async_trait]
pub trait ToolHost: Send + Sync {
    /// Execute a tool by name with the given arguments.
    async fn execute(
        &self,
        tool_name: &str,
        arguments: serde_json::Value,
        context: ToolContext,
    ) -> Result<ToolResult, DomainError>;

    /// List available tool schemas for an agent.
    fn available_tools(&self, agent_id: &str) -> Vec<crate::ports::llm::ToolSchema>;
}

#[derive(Debug, Clone)]
pub struct ToolContext {
    pub agent_id: String,
    pub run_id: uuid::Uuid,
    pub workspace_root: String,
}

#[derive(Debug, Clone)]
pub struct ToolResult {
    pub success: bool,
    pub content: String,
    pub metadata: Option<serde_json::Value>,
}
