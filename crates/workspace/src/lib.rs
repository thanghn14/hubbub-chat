//! # hubbub-workspace
//!
//! Workspace service: atomic file writes, auto-versioning, file watcher, indexer.

pub mod errors;
pub mod service;

pub use errors::WorkspaceError;
pub use service::LocalWorkspaceService;
