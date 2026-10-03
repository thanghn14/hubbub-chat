//! Agent permission validation checker.

use hubbub_domain::entities::agent::{AgentPermissions, NetworkPolicy};

use crate::errors::PolicyError;

pub struct PermissionChecker;

impl PermissionChecker {
    /// Verify whether an agent has permission to access the network.
    pub fn check_network(
        agent_id: &str,
        policy: &NetworkPolicy,
        is_search_engine: bool,
    ) -> Result<(), PolicyError> {
        match policy {
            NetworkPolicy::Open => Ok(()),
            NetworkPolicy::SearchOnly => {
                if is_search_engine {
                    Ok(())
                } else {
                    Err(PolicyError::PermissionDenied {
                        agent_id: agent_id.to_string(),
                        operation: "web_fetch".to_string(),
                        reason: "Agent has SearchOnly network policy (arbitrary web fetch is restricted)".to_string(),
                    })
                }
            }
            NetworkPolicy::Allowlist => {
                if is_search_engine {
                    Ok(())
                } else {
                    Err(PolicyError::PermissionDenied {
                        agent_id: agent_id.to_string(),
                        operation: "web_fetch".to_string(),
                        reason: "Agent has Allowlist network policy (domain allowlist verification required)".to_string(),
                    })
                }
            }
            NetworkPolicy::None => Err(PolicyError::PermissionDenied {
                agent_id: agent_id.to_string(),
                operation: if is_search_engine {
                    "web_search".to_string()
                } else {
                    "web_fetch".to_string()
                },
                reason: "Agent has NetworkPolicy::None (internet access is completely blocked)".to_string(),
            }),
        }
    }

    /// Check if a relative path matches any pattern in fs_read permissions.
    pub fn check_fs_read(
        agent_id: &str,
        permissions: &AgentPermissions,
        path: &str,
    ) -> Result<(), PolicyError> {
        if Self::matches_any_pattern(&permissions.fs_read, path) {
            Ok(())
        } else {
            Err(PolicyError::PermissionDenied {
                agent_id: agent_id.to_string(),
                operation: "fs_read".to_string(),
                reason: format!("Path '{path}' is not within allowed read patterns"),
            })
        }
    }

    /// Check if a relative path matches any pattern in fs_write permissions.
    pub fn check_fs_write(
        agent_id: &str,
        permissions: &AgentPermissions,
        path: &str,
    ) -> Result<(), PolicyError> {
        if Self::matches_any_pattern(&permissions.fs_write, path) {
            Ok(())
        } else {
            Err(PolicyError::PermissionDenied {
                agent_id: agent_id.to_string(),
                operation: "fs_write".to_string(),
                reason: format!("Path '{path}' is not within allowed write patterns"),
            })
        }
    }

    /// Match a relative path against patterns like "**", "reports/**", "notes/*", etc.
    fn matches_any_pattern(patterns: &[String], relative_path: &str) -> bool {
        let normalized = relative_path.replace('\\', "/");
        for pattern in patterns {
            let pat = pattern.replace('\\', "/");
            if pat == "**" || pat == "*" {
                return true;
            }
            if let Some(prefix) = pat.strip_suffix("/**") {
                if normalized.strip_prefix(prefix).is_some_and(|rest| rest.is_empty() || rest.starts_with('/')) {
                    return true;
                }
            } else if pat == normalized {
                return true;
            }
        }
        false
    }
}
