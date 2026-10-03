//! Error types for workspace operations.

use thiserror::Error;
use hubbub_domain::errors::DomainError;

#[derive(Debug, Error)]
pub enum WorkspaceError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Policy error: {0}")]
    Policy(#[from] hubbub_policy::PolicyError),

    #[error("File not found: '{0}'")]
    NotFound(String),

    #[error("File exceeds maximum allowed size ({actual} bytes > {max} bytes)")]
    FileTooLarge { actual: u64, max: u64 },

    #[error("File contains invalid non-UTF-8 content: '{0}'")]
    InvalidUtf8(String),

    #[error("Protected path: cannot write to '{0}'")]
    ProtectedPath(String),
}

impl From<WorkspaceError> for DomainError {
    fn from(err: WorkspaceError) -> Self {
        match err {
            WorkspaceError::NotFound(path) => DomainError::NotFound {
                entity_type: "file",
                id: path,
            },
            WorkspaceError::Policy(p) => DomainError::PermissionDenied(p.to_string()),
            WorkspaceError::ProtectedPath(p) => DomainError::PermissionDenied(format!("Protected path: '{p}'")),
            WorkspaceError::FileTooLarge { actual, max } => DomainError::Validation(format!(
                "File too large ({actual} bytes > {max} bytes)"
            )),
            WorkspaceError::InvalidUtf8(path) => DomainError::Validation(format!(
                "File '{path}' is not valid UTF-8"
            )),
            WorkspaceError::Io(e) => DomainError::Internal(format!("I/O error: {e}")),
        }
    }
}
