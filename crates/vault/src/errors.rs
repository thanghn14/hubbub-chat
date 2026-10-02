use hubbub_domain::errors::DomainError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum VaultError {
    #[error("Keyring error for key '{key}': {message}")]
    Keyring { key: String, message: String },

    #[error("Secret storage unavailable: {0}")]
    Unavailable(String),
}

impl From<VaultError> for DomainError {
    fn from(err: VaultError) -> Self {
        match err {
            VaultError::Keyring { key, message } => {
                DomainError::Internal(format!("Vault error for '{key}': {message}"))
            }
            VaultError::Unavailable(msg) => {
                DomainError::Internal(format!("Vault unavailable: {msg}"))
            }
        }
    }
}
