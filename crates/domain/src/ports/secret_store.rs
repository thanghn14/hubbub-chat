use async_trait::async_trait;
use crate::errors::DomainError;

/// Port for secret/credential storage (OS keyring).
#[async_trait]
pub trait SecretStore: Send + Sync {
    /// Store a secret. Overwrites if exists.
    async fn set(&self, key: &str, value: &str) -> Result<(), DomainError>;

    /// Retrieve a secret. Returns None if not found.
    async fn get(&self, key: &str) -> Result<Option<String>, DomainError>;

    /// Delete a secret.
    async fn delete(&self, key: &str) -> Result<(), DomainError>;
}
