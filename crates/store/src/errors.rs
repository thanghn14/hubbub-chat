use hubbub_domain::errors::DomainError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StoreError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Migration error: {0}")]
    Migration(#[from] sqlx::migrate::MigrateError),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Invalid data format: {0}")]
    InvalidData(String),
}

impl From<StoreError> for DomainError {
    fn from(err: StoreError) -> Self {
        match err {
            StoreError::InvalidData(msg) => DomainError::Validation(msg),
            other => DomainError::Internal(other.to_string()),
        }
    }
}
