use async_trait::async_trait;
use crate::errors::DomainError;
use crate::entities::document::Document;

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
}
