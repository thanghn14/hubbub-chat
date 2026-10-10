//! Report reading tool for reading markdown reports from reports/.

use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::workspace_service::WorkspaceService;
use std::sync::Arc;

pub struct ReportReadTool {
    workspace: Arc<dyn WorkspaceService>,
}

impl ReportReadTool {
    pub fn new(workspace: Arc<dyn WorkspaceService>) -> Self {
        Self { workspace }
    }

    pub async fn read_report(&self, filename: &str) -> Result<String, DomainError> {
        let trimmed = filename.trim();
        if trimmed.is_empty() {
            return Ok("Lỗi: Tên tệp báo cáo không được để trống.".to_string());
        }

        let clean_path = if trimmed.starts_with("reports/") || trimmed.starts_with("reports\\") {
            trimmed.to_string()
        } else {
            format!("reports/{trimmed}")
        };

        match self.workspace.read_file(&clean_path).await {
            Ok(content) => Ok(content),
            Err(e) => Ok(format!("Lỗi khi đọc báo cáo '{clean_path}': {e}")),
        }
    }
}
