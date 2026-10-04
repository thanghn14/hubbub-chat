//! Local filesystem implementation of WorkspaceService.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{Duration, Instant};
use async_trait::async_trait;
use chrono::Utc;
use sha2::{Digest, Sha256};
use tokio::io::AsyncWriteExt;
use tokio::sync::RwLock;
use uuid::Uuid;

use hubbub_domain::entities::document::Document;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::workspace_service::WorkspaceService;
use hubbub_policy::PathGuard;

use crate::errors::WorkspaceError;

const DEFAULT_MAX_FILE_SIZE: u64 = 5 * 1024 * 1024; // 5 MB
const MAX_VERSIONS_PER_FILE: usize = 20;

#[derive(Debug, Clone)]
pub struct LocalWorkspaceService {
    root: PathBuf,
    max_file_size: u64,
    self_writes: Arc<RwLock<HashMap<PathBuf, Instant>>>,
}

impl LocalWorkspaceService {
    pub fn new<P: AsRef<Path>>(root: P) -> Self {
        Self {
            root: root.as_ref().to_path_buf(),
            max_file_size: DEFAULT_MAX_FILE_SIZE,
            self_writes: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn with_max_file_size<P: AsRef<Path>>(root: P, max_file_size: u64) -> Self {
        Self {
            root: root.as_ref().to_path_buf(),
            max_file_size,
            self_writes: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn record_self_write(&self, path: &Path) {
        let mut map = self.self_writes.write().await;
        map.insert(path.to_path_buf(), Instant::now());
    }

    pub async fn is_recent_self_write(&self, path: &Path) -> bool {
        let mut map = self.self_writes.write().await;
        let now = Instant::now();
        map.retain(|_, time| now.duration_since(*time) < Duration::from_secs(3));
        map.contains_key(path)
    }

    /// Backup previous version of a file into .versions/ before overwriting.
    async fn backup_version(&self, relative_path: &str, target_path: &Path) {
        if !target_path.exists() {
            return;
        }

        let versions_dir = self.root.join(".versions");
        if tokio::fs::create_dir_all(&versions_dir).await.is_err() {
            return;
        }

        let safe_rel = relative_path.replace(['/', '\\'], "_");
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S_%3f");
        let backup_name = format!("{safe_rel}.{timestamp}.bak");
        let backup_path = versions_dir.join(&backup_name);

        let _ = tokio::fs::copy(target_path, &backup_path).await;
        self.cleanup_old_versions(&versions_dir, &safe_rel).await;
    }

    async fn cleanup_old_versions(&self, versions_dir: &Path, prefix: &str) {
        let mut entries = match tokio::fs::read_dir(versions_dir).await {
            Ok(rd) => rd,
            Err(_) => return,
        };

        let mut matches = Vec::new();
        while let Ok(Some(entry)) = entries.next_entry().await {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(prefix) && name.ends_with(".bak") {
                matches.push((name, entry.path()));
            }
        }

        if matches.len() > MAX_VERSIONS_PER_FILE {
            matches.sort_by(|a, b| a.0.cmp(&b.0));
            let remove_count = matches.len() - MAX_VERSIONS_PER_FILE;
            for (_, path) in matches.into_iter().take(remove_count) {
                let _ = tokio::fs::remove_file(path).await;
            }
        }
    }

    fn extract_markdown_title(content: &str, fallback_stem: &str) -> String {
        for line in content.lines().take(10) {
            let trimmed = line.trim();
            if let Some(title) = trimmed.strip_prefix('#') {
                let cleaned = title.trim();
                if !cleaned.is_empty() && !cleaned.starts_with('#') {
                    return cleaned.to_string();
                }
            }
        }
        fallback_stem.to_string()
    }
}

#[async_trait]
impl WorkspaceService for LocalWorkspaceService {
    fn workspace_root(&self) -> &str {
        self.root.to_str().unwrap_or("")
    }

    async fn write_file(&self, relative_path: &str, content: &str) -> Result<(), DomainError> {
        let target = PathGuard::check_write_path(&self.root, relative_path)
            .map_err(WorkspaceError::Policy)?;

        if let Some(parent) = target.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(WorkspaceError::Io)?;
        }

        self.backup_version(relative_path, &target).await;

        let temp_filename = format!(
            ".tmp_{}_{}",
            target.file_name().and_then(|f| f.to_str()).unwrap_or("file"),
            Uuid::now_v7()
        );
        let temp_path = target
            .parent()
            .unwrap_or_else(|| Path::new(&self.root))
            .join(temp_filename);

        let mut file = tokio::fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp_path)
            .await
            .map_err(WorkspaceError::Io)?;

        file.write_all(content.as_bytes())
            .await
            .map_err(WorkspaceError::Io)?;
        file.sync_all().await.map_err(WorkspaceError::Io)?;
        drop(file);

        if let Err(e) = tokio::fs::rename(&temp_path, &target).await {
            let _ = tokio::fs::remove_file(&temp_path).await;
            return Err(WorkspaceError::Io(e).into());
        }

        self.record_self_write(&target).await;

        Ok(())
    }

    async fn read_file(&self, relative_path: &str) -> Result<String, DomainError> {
        let target = PathGuard::resolve_within_workspace(&self.root, relative_path)
            .map_err(WorkspaceError::Policy)?;

        if !target.exists() {
            return Err(WorkspaceError::NotFound(relative_path.to_string()).into());
        }

        let metadata = tokio::fs::metadata(&target)
            .await
            .map_err(WorkspaceError::Io)?;

        if metadata.is_dir() {
            return Err(DomainError::Validation(format!(
                "'{relative_path}' is a directory, not a file"
            )));
        }

        if metadata.len() > self.max_file_size {
            return Err(WorkspaceError::FileTooLarge {
                actual: metadata.len(),
                max: self.max_file_size,
            }
            .into());
        }

        let bytes = tokio::fs::read(&target)
            .await
            .map_err(WorkspaceError::Io)?;

        String::from_utf8(bytes)
            .map_err(|_| WorkspaceError::InvalidUtf8(relative_path.to_string()).into())
    }

    async fn list_files(&self, relative_path: &str) -> Result<Vec<String>, DomainError> {
        let target = if relative_path.is_empty() || relative_path == "." {
            self.root.clone()
        } else {
            PathGuard::resolve_within_workspace(&self.root, relative_path)
                .map_err(WorkspaceError::Policy)?
        };

        if !target.exists() {
            return Ok(Vec::new());
        }

        let mut entries = tokio::fs::read_dir(&target)
            .await
            .map_err(WorkspaceError::Io)?;

        let mut results = Vec::new();
        while let Ok(Some(entry)) = entries.next_entry().await {
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.starts_with('.') {
                continue;
            }

            if let Ok(rel) = entry.path().strip_prefix(&self.root) {
                let rel_str = rel.to_string_lossy().replace('\\', "/");
                results.push(rel_str);
            }
        }

        results.sort();
        Ok(results)
    }

    async fn reindex_file(&self, relative_path: &str) -> Result<Option<Document>, DomainError> {
        let target = PathGuard::resolve_within_workspace(&self.root, relative_path)
            .map_err(WorkspaceError::Policy)?;

        if !target.is_file() {
            return Ok(None);
        }

        let content = self.read_file(relative_path).await?;
        let metadata = tokio::fs::metadata(&target)
            .await
            .map_err(WorkspaceError::Io)?;

        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        let hash_str = format!("{:x}", hasher.finalize());

        let stem = target
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or(relative_path);
        let title = Self::extract_markdown_title(&content, stem);

        let now = Utc::now();
        Ok(Some(Document {
            id: Uuid::now_v7(),
            path: relative_path.replace('\\', "/"),
            title,
            tags: Vec::new(),
            agent_id: None,
            run_id: None,
            content_hash: hash_str,
            size_bytes: metadata.len(),
            created_at: now,
            updated_at: now,
        }))
    }

    async fn is_recent_self_write(&self, path: &Path) -> bool {
        let mut map = self.self_writes.write().await;
        let now = Instant::now();
        map.retain(|_, time| now.duration_since(*time) < Duration::from_secs(3));
        map.contains_key(path)
    }
}
