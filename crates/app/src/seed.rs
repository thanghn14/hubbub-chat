use hubbub_domain::entities::agent::{
    Agent, AgentBudget, AgentDelegation, AgentPermissions, AgentTools, NetworkPolicy,
};

pub fn default_agents() -> Vec<Agent> {
    vec![
        Agent {
            id: "researcher".to_string(),
            name: "Research Agent".to_string(),
            model: "claude-sonnet-4-20250514".to_string(),
            system_prompt: r#"You are a Research Agent specialized in finding, analyzing, and synthesizing information from the web.
## Core Capabilities:
- Search the web for relevant sources
- Fetch and read web pages
- Write comprehensive research reports in Markdown format
- Include proper citations for all claims
## Guidelines:
1. Always cite sources: Every important claim must have a source URL.
2. Be thorough: Search multiple sources before drawing conclusions.
3. Be honest: Clearly state when information is uncertain or conflicting.
4. Structure reports well: Use headings, bullet points, and tables for clarity.
5. Language: Respond in the same language the user uses."#
                .to_string(),
            tools: AgentTools {
                builtin: vec![
                    "web_search".to_string(),
                    "web_fetch".to_string(),
                    "report_write".to_string(),
                    "report_read".to_string(),
                    "report_list".to_string(),
                ],
                mcp: vec![],
            },
            permissions: AgentPermissions {
                fs_read: vec![],
                fs_write: vec!["reports/**".to_string()],
                network: NetworkPolicy::Open,
            },
            budget: AgentBudget {
                max_steps: 30,
                max_tokens: 200_000,
                max_cost_usd: 1.0,
                timeout_s: 600,
            },
            delegation: AgentDelegation {
                can_delegate_to: vec![],
            },
            version: 1,
        },
        Agent {
            id: "librarian".to_string(),
            name: "Librarian Agent".to_string(),
            model: "claude-sonnet-4-20250514".to_string(),
            system_prompt: r#"You are a Librarian Agent specialized in managing and organizing local files and notes.
You have read/write access to the user workspace but NO internet access.
Ensure accuracy and preserve file integrity."#
                .to_string(),
            tools: AgentTools {
                builtin: vec![
                    "fs_read".to_string(),
                    "fs_list".to_string(),
                    "report_read".to_string(),
                    "report_write".to_string(),
                ],
                mcp: vec![],
            },
            permissions: AgentPermissions {
                fs_read: vec!["**".to_string()],
                fs_write: vec!["notes/**".to_string(), "reports/**".to_string()],
                network: NetworkPolicy::None,
            },
            budget: AgentBudget {
                max_steps: 20,
                max_tokens: 150_000,
                max_cost_usd: 0.5,
                timeout_s: 300,
            },
            delegation: AgentDelegation {
                can_delegate_to: vec![],
            },
            version: 1,
        },
        Agent {
            id: "tutor".to_string(),
            name: "Tutor Agent".to_string(),
            model: "gpt-4o-mini".to_string(),
            system_prompt: r#"You are a patient and knowledgeable Tutor Agent.
Help users learn complex topics by breaking them down into digestible concepts with clear examples."#
                .to_string(),
            tools: AgentTools {
                builtin: vec!["web_search".to_string()],
                mcp: vec![],
            },
            permissions: AgentPermissions {
                fs_read: vec![],
                fs_write: vec![],
                network: NetworkPolicy::SearchOnly,
            },
            budget: AgentBudget {
                max_steps: 15,
                max_tokens: 100_000,
                max_cost_usd: 0.3,
                timeout_s: 180,
            },
            delegation: AgentDelegation {
                can_delegate_to: vec![],
            },
            version: 1,
        },
    ]
}
