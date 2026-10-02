//! Port traits (interfaces) for external dependencies.
//!
//! These are implemented by adapter crates in the infrastructure layer.
//! Domain and agent crates depend only on these traits, never on concrete implementations.

pub mod event_sink;
pub mod llm;
pub mod secret_store;
pub mod store;
pub mod tool_host;
pub mod workspace_service;
