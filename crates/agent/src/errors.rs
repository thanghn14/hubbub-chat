use hubbub_domain::errors::DomainError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AgentError {
    #[error("Domain error: {0}")]
    Domain(#[from] DomainError),

    #[error("Budget exceeded: {0}")]
    BudgetExceeded(String),

    #[error("Run cancelled")]
    Cancelled,

    #[error("LLM error: {0}")]
    Llm(String),

    #[error("Tool error ({name}): {message}")]
    Tool { name: String, message: String },

    #[error("Store error: {0}")]
    Store(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<AgentError> for DomainError {
    fn from(err: AgentError) -> Self {
        match err {
            AgentError::Domain(d) => d,
            AgentError::BudgetExceeded(msg) => DomainError::BudgetExceeded(msg),
            AgentError::Cancelled => DomainError::Cancelled,
            AgentError::Llm(msg) => DomainError::Internal(format!("LLM error: {msg}")),
            AgentError::Tool { name, message } => {
                DomainError::Internal(format!("Tool {name} error: {message}"))
            }
            AgentError::Store(msg) => DomainError::Internal(format!("Store error: {msg}")),
            AgentError::Internal(msg) => DomainError::Internal(msg),
        }
    }
}
