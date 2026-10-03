//! Filesystem directory listing tool for agents.

use std::sync::Arc;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::workspace_service::WorkspaceService;

pub struct FsListTool {
    workspace: Arc<dyn WorkspaceService>,
}

impl FsListTool {
    pub fn new(workspace: Arc<dyn WorkspaceService>) -> Self {
        Self { workspace }
    }

    pub async fn list(&self, path: Option<&str>) -> Result<String, DomainError> {
        let dir_path = path.unwrap_or(".").trim();
        let target = if dir_path.is_empty() { "." } else { dir_path };

        let files = match self.workspace.list_files(target).await {
            Ok(f) => f,
            Err(e) => return Ok(format!("Lỗi khi liệt kê thư mục '{target}': {e}")),
        };

        if files.is_empty() {
            return Ok(format!("Thư mục `{target}` hiện đang trống hoặc không có tệp tin nào."));
        }

        let mut output = format!("### Danh sách tệp trong `{target}` (tổng cộng: {} tệp):\n\n", files.len());
        for f in files {
            output.push_str(&format!("- `{f}`\n"));
        }

        Ok(output)
    }
}
