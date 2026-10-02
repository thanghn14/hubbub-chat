use hubbub_domain::errors::DomainError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum LlmError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("API error ({status}): {message}")]
    Api { status: u16, message: String },

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Request timed out: {0}")]
    Timeout(String),

    #[error("Stream error: {0}")]
    Stream(String),
}

impl From<LlmError> for DomainError {
    fn from(err: LlmError) -> Self {
        match err {
            LlmError::Api { status, message } => {
                if status == 401 || status == 403 {
                    DomainError::PermissionDenied(format!(
                        "Authentication failed ({status}): {message}"
                    ))
                } else if status == 400 {
                    DomainError::Validation(message)
                } else {
                    DomainError::Internal(format!("API error ({status}): {message}"))
                }
            }
            LlmError::Timeout(msg) => DomainError::Internal(format!("Timeout: {msg}")),
            other => DomainError::Internal(other.to_string()),
        }
    }
}
