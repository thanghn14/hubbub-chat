use hubbub_domain::entities::agent::{
    Agent, AgentBudget, AgentDelegation, AgentPermissions, AgentTools, NetworkPolicy,
};

pub fn create_test_agent(id: &str, system_prompt: &str) -> Agent {
    Agent {
        id: id.to_string(),
        name: format!("Agent {id}"),
        model: "gpt-4o-mini".to_string(),
        system_prompt: system_prompt.to_string(),
        tools: AgentTools {
            builtin: vec!["web_search".to_string(), "fs_read".to_string()],
            mcp: vec![],
        },
        permissions: AgentPermissions {
            fs_read: vec!["/workspace".to_string()],
            fs_write: vec!["/workspace/reports".to_string()],
            network: NetworkPolicy::SearchOnly,
        },
        budget: AgentBudget {
            max_steps: 10,
            max_tokens: 100_000,
            max_cost_usd: 1.0,
            timeout_s: 60,
        },
        delegation: AgentDelegation {
            can_delegate_to: vec![],
        },
        version: 1,
    }
}
