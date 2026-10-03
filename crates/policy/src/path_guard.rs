//! Path traversal protection guard.

use std::path::{Component, Path, PathBuf};

use crate::errors::PolicyError;

pub struct PathGuard;

impl PathGuard {
    /// Resolve and sanitize a relative path strictly within workspace_root.
    /// Rejects parent traversal (`..`), absolute paths, null bytes, colons/ADS, and UNC paths.
    pub fn resolve_within_workspace(
        workspace_root: &Path,
        relative_path: &str,
    ) -> Result<PathBuf, PolicyError> {
        let trimmed = relative_path.trim();
        if trimmed.is_empty() {
            return Err(PolicyError::InvalidPath("Path cannot be empty".to_string()));
        }

        // Check for forbidden characters (null byte, Windows ADS)
        if trimmed.contains('\0') {
            return Err(PolicyError::InvalidPath(
                "Null bytes not allowed in path".to_string(),
            ));
        }
        if trimmed.contains(':') {
            return Err(PolicyError::InvalidPath(
                "Colons or alternate data streams not allowed in path".to_string(),
            ));
        }

        let p = Path::new(trimmed);

        // Disallow absolute paths and root separators
        if p.is_absolute() || trimmed.starts_with('/') || trimmed.starts_with('\\') {
            return Err(PolicyError::AbsolutePathDisallowed(trimmed.to_string()));
        }

        let mut clean_components = Vec::new();
        for component in p.components() {
            match component {
                Component::Prefix(_) | Component::RootDir => {
                    return Err(PolicyError::AbsolutePathDisallowed(trimmed.to_string()));
                }
                Component::ParentDir => {
                    return Err(PolicyError::PathTraversal {
                        path: trimmed.to_string(),
                    });
                }
                Component::CurDir => continue,
                Component::Normal(c) => clean_components.push(c),
            }
        }

        if clean_components.is_empty() {
            if trimmed == "." {
                return Ok(workspace_root.to_path_buf());
            }
            return Err(PolicyError::InvalidPath("Path resolves to empty".to_string()));
        }

        let mut resolved = workspace_root.to_path_buf();
        for c in clean_components {
            resolved.push(c);
        }

        Ok(resolved)
    }

    /// Checks whether a relative path is a protected system directory or file
    /// that tools are strictly forbidden from modifying (e.g. agents/, config.toml, .versions/).
    pub fn is_protected_path(relative_path: &str) -> bool {
        let normalized = relative_path.replace('\\', "/");
        let trimmed = normalized.trim_matches('/');

        trimmed == "config.toml"
            || trimmed == ".env"
            || trimmed == ".git"
            || trimmed.starts_with(".git/")
            || trimmed == "agents"
            || trimmed.starts_with("agents/")
            || trimmed == ".versions"
            || trimmed.starts_with(".versions/")
    }

    /// Resolve and sanitize a relative path strictly within workspace_root,
    /// and verify that it is NOT a protected system path.
    pub fn check_write_path(
        workspace_root: &Path,
        relative_path: &str,
    ) -> Result<PathBuf, PolicyError> {
        let resolved = Self::resolve_within_workspace(workspace_root, relative_path)?;
        if Self::is_protected_path(relative_path) {
            return Err(PolicyError::PermissionDenied {
                agent_id: "system".to_string(),
                operation: "fs_write".to_string(),
                reason: format!("Writing to protected path '{relative_path}' is strictly forbidden"),
            });
        }
        Ok(resolved)
    }
}
