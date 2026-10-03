//! Filesystem read tool for agents.

use std::sync::Arc;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::workspace_service::WorkspaceService;

const MAX_PREVIEW_CHARS: usize = 20_000;

pub struct FsReadTool {
    workspace: Arc<dyn WorkspaceService>,
}

impl FsReadTool {
    pub fn new(workspace: Arc<dyn WorkspaceService>) -> Self {
        Self { workspace }
    }

    pub async fn read(&self, path: &str) -> Result<String, DomainError> {
        let trimmed = path.trim();
        if trimmed.is_empty() {
            return Ok("Lỗi: Đường dẫn tệp tin không được để trống.".to_string());
        }

        let content = match self.workspace.read_file(trimmed).await {
            Ok(c) => c,
            Err(e) => return Ok(format!("Lỗi khi đọc tệp '{trimmed}': {e}")),
        };

        if content.chars().count() > MAX_PREVIEW_CHARS {
            let truncated: String = content.chars().take(MAX_PREVIEW_CHARS).collect();
            let total = content.chars().count();
            Ok(format!(
                "### Nội dung tệp: `{trimmed}`\n\n```\n{truncated}\n```\n\n[... Đã hiển thị {MAX_PREVIEW_CHARS} / {total} ký tự. Nội dung tệp còn tiếp ...]"
            ))
        } else {
            Ok(format!("### Nội dung tệp: `{trimmed}`\n\n```\n{content}\n```"))
        }
    }
}
