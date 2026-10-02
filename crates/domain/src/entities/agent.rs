use serde::{Deserialize, Serialize};

/// An AI agent definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub model: String,
    pub system_prompt: String,
    pub tools: AgentTools,
    pub permissions: AgentPermissions,
    pub budget: AgentBudget,
    pub delegation: AgentDelegation,
    pub version: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTools {
    pub builtin: Vec<String>,
    pub mcp: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentPermissions {
    pub fs_read: Vec<String>,
    pub fs_write: Vec<String>,
    pub network: NetworkPolicy,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum NetworkPolicy {
    None,
    SearchOnly,
    Allowlist,
    Open,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentBudget {
    pub max_steps: u32,
    pub max_tokens: u64,
    pub max_cost_usd: f64,
    pub timeout_s: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentDelegation {
    pub can_delegate_to: Vec<String>,
}
