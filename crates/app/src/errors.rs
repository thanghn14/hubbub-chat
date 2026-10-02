use hubbub_domain::errors::DomainError;
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Domain error: {0}")]
    Domain(#[from] DomainError),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Vault error: {0}")]
    Vault(String),

    #[error("Store error: {0}")]
    Store(#[from] hubbub_store::StoreError),

    #[error("Agent error: {0}")]
    Agent(String),

    #[error("Entity not found: {0}")]
    NotFound(String),

    #[error("Provider '{provider}' error: {message}")]
    Provider { provider: String, message: String },
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
