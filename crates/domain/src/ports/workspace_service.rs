use crate::entities::document::Document;
use crate::errors::DomainError;
use async_trait::async_trait;

/// Port for workspace filesystem operations.
#[async_trait]
pub trait WorkspaceService: Send + Sync {
    /// Write content to a file in the workspace (atomic: tmp → fsync → rename).
    async fn write_file(&self, relative_path: &str, content: &str) -> Result<(), DomainError>;

    /// Read a file from the workspace.
    async fn read_file(&self, relative_path: &str) -> Result<String, DomainError>;

    /// List files in a workspace directory.
    async fn list_files(&self, relative_path: &str) -> Result<Vec<String>, DomainError>;

    /// Get the absolute path of the workspace root.
    fn workspace_root(&self) -> &str;

    /// Re-index a file (update document metadata in store).
    async fn reindex_file(&self, relative_path: &str) -> Result<Option<Document>, DomainError>;

    /// Check if a path was recently written by this service (to avoid re-indexing loops).
    async fn is_recent_self_write(&self, _path: &std::path::Path) -> bool {
        false
    }
}
