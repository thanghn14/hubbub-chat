//! Error types for Hubbub tools.

use thiserror::Error;

#[derive(Debug, Error)]
pub enum ToolError {
    #[error("Missing required parameter: '{0}'")]
    MissingParameter(&'static str),

    #[error("Network request failed: {0}")]
    Network(String),

    #[error("Security policy violation: {0}")]
    Policy(#[from] hubbub_policy::PolicyError),

    #[error("Content parsing error: {0}")]
    Parsing(String),

    #[error("Tool execution failed: {0}")]
    Execution(String),
}
