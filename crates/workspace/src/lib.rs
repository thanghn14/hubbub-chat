//! # hubbub-workspace
//!
//! Workspace service: atomic file writes, auto-versioning, file watcher, indexer.

pub mod errors;
pub mod service;
pub mod watcher;

pub use errors::WorkspaceError;
pub use service::LocalWorkspaceService;
pub use watcher::{WorkspaceWatcher, WorkspaceWatcherSink};
