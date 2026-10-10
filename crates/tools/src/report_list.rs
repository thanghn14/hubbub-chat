//! Report listing tool for listing all markdown reports in reports/.

use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::workspace_service::WorkspaceService;
use std::sync::Arc;

pub struct ReportListTool {
    workspace: Arc<dyn WorkspaceService>,
}

impl ReportListTool {
    pub fn new(workspace: Arc<dyn WorkspaceService>) -> Self {
        Self { workspace }
    }

    pub async fn list_reports(&self) -> Result<String, DomainError> {
        let files = match self.workspace.list_files("reports").await {
            Ok(f) => f,
            Err(e) => return Ok(format!("Lỗi khi liệt kê báo cáo: {e}")),
        };

        let md_reports: Vec<String> = files.into_iter().filter(|f| f.ends_with(".md")).collect();
        if md_reports.is_empty() {
            return Ok("Thư mục `reports/` hiện chưa có báo cáo nào.".to_string());
        }

        let mut output = format!(
            "### Danh sách Báo cáo trong Workspace (tổng cộng: {} báo cáo):\n\n",
            md_reports.len()
        );
        for r in md_reports {
            let filename = r.strip_prefix("reports/").unwrap_or(&r);
            output.push_str(&format!("- `{filename}` (Đường dẫn: `{r}`)\n"));
        }

        Ok(output)
    }
}
