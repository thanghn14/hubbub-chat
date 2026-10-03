//! Built-in tool host connecting agents to tools.

use std::sync::Arc;
use async_trait::async_trait;
use serde_json::Value;

use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::ToolSchema;
use hubbub_domain::ports::store::Store;
use hubbub_domain::ports::tool_host::{ToolContext, ToolHost, ToolResult};
use hubbub_domain::ports::workspace_service::WorkspaceService;

use crate::fs_list::FsListTool;
use crate::fs_read::FsReadTool;
use crate::report_list::ReportListTool;
use crate::report_read::ReportReadTool;
use crate::report_write::ReportWriteTool;
use crate::web_fetch::WebFetchTool;
use crate::web_search::WebSearchTool;

pub struct BuiltinToolHost {
    web_search: WebSearchTool,
    web_fetch: WebFetchTool,
    fs_read: Option<FsReadTool>,
    fs_list: Option<FsListTool>,
    report_write: Option<ReportWriteTool>,
    report_read: Option<ReportReadTool>,
    report_list: Option<ReportListTool>,
}

impl Default for BuiltinToolHost {
    fn default() -> Self {
        Self::new()
    }
}

impl BuiltinToolHost {
    pub fn new() -> Self {
        Self {
            web_search: WebSearchTool::new(),
            web_fetch: WebFetchTool::new(),
            fs_read: None,
            fs_list: None,
            report_write: None,
            report_read: None,
            report_list: None,
        }
    }

    pub fn with_workspace(
        workspace: Arc<dyn WorkspaceService>,
        store: Option<Arc<dyn Store>>,
    ) -> Self {
        Self {
            web_search: WebSearchTool::new(),
            web_fetch: WebFetchTool::new(),
            fs_read: Some(FsReadTool::new(workspace.clone())),
            fs_list: Some(FsListTool::new(workspace.clone())),
            report_write: Some(ReportWriteTool::new(workspace.clone(), store)),
            report_read: Some(ReportReadTool::new(workspace.clone())),
            report_list: Some(ReportListTool::new(workspace)),
        }
    }

    async fn exec_web_search(&self, arguments: &Value) -> Result<ToolResult, DomainError> {
        let query = arguments.get("query").and_then(Value::as_str).unwrap_or("").trim();
        if query.is_empty() {
            return Ok(ToolResult {
                success: false,
                content: "Lỗi: Tham số 'query' không được để trống khi tìm kiếm web.".to_string(),
                metadata: None,
            });
        }
        match self.web_search.search(query).await {
            Ok(content) => Ok(ToolResult { success: true, content, metadata: None }),
            Err(e) => Ok(ToolResult { success: false, content: format!("Lỗi tìm kiếm web: {e}"), metadata: None }),
        }
    }

    async fn exec_web_fetch(&self, arguments: &Value) -> Result<ToolResult, DomainError> {
        let url = arguments.get("url").and_then(Value::as_str).unwrap_or("").trim();
        if url.is_empty() {
            return Ok(ToolResult {
                success: false,
                content: "Lỗi: Tham số 'url' không được để trống khi truy cập web.".to_string(),
                metadata: None,
            });
        }
        match self.web_fetch.fetch(url).await {
            Ok(content) => Ok(ToolResult { success: true, content, metadata: None }),
            Err(e) => Ok(ToolResult { success: false, content: format!("Lỗi truy cập trang web: {e}"), metadata: None }),
        }
    }

    async fn exec_fs_read(&self, arguments: &Value) -> Result<ToolResult, DomainError> {
        let path = arguments.get("path").and_then(Value::as_str).unwrap_or("");
        if let Some(tool) = &self.fs_read {
            let content = tool.read(path).await?;
            let success = !content.starts_with("Lỗi");
            Ok(ToolResult { success, content, metadata: None })
        } else {
            Ok(ToolResult {
                success: false,
                content: "Lỗi: Dịch vụ Workspace chưa được khởi tạo để đọc tệp tin.".to_string(),
                metadata: None,
            })
        }
    }

    async fn exec_fs_list(&self, arguments: &Value) -> Result<ToolResult, DomainError> {
        let path = arguments.get("path").and_then(Value::as_str);
        if let Some(tool) = &self.fs_list {
            let content = tool.list(path).await?;
            let success = !content.starts_with("Lỗi");
            Ok(ToolResult { success, content, metadata: None })
        } else {
            Ok(ToolResult {
                success: false,
                content: "Lỗi: Dịch vụ Workspace chưa được khởi tạo để liệt kê tệp tin.".to_string(),
                metadata: None,
            })
        }
    }

    async fn exec_report_write(&self, arguments: &Value, context: &ToolContext) -> Result<ToolResult, DomainError> {
        let title = arguments.get("title").and_then(Value::as_str).unwrap_or("");
        let content = arguments.get("content").and_then(Value::as_str).unwrap_or("");
        let filename = arguments.get("filename").and_then(Value::as_str);
        if let Some(tool) = &self.report_write {
            let res = tool.write_report(title, content, filename, context).await?;
            let success = !res.starts_with("Lỗi");
            Ok(ToolResult { success, content: res, metadata: None })
        } else {
            Ok(ToolResult {
                success: false,
                content: "Lỗi: Dịch vụ Workspace chưa được khởi tạo để lưu báo cáo.".to_string(),
                metadata: None,
            })
        }
    }

    async fn exec_report_read(&self, arguments: &Value) -> Result<ToolResult, DomainError> {
        let filename = arguments.get("filename").and_then(Value::as_str).unwrap_or("");
        if let Some(tool) = &self.report_read {
            let content = tool.read_report(filename).await?;
            let success = !content.starts_with("Lỗi");
            Ok(ToolResult { success, content, metadata: None })
        } else {
            Ok(ToolResult {
                success: false,
                content: "Lỗi: Dịch vụ Workspace chưa được khởi tạo để đọc báo cáo.".to_string(),
                metadata: None,
            })
        }
    }

    async fn exec_report_list(&self) -> Result<ToolResult, DomainError> {
        if let Some(tool) = &self.report_list {
            let content = tool.list_reports().await?;
            let success = !content.starts_with("Lỗi");
            Ok(ToolResult { success, content, metadata: None })
        } else {
            Ok(ToolResult {
                success: false,
                content: "Lỗi: Dịch vụ Workspace chưa được khởi tạo để liệt kê báo cáo.".to_string(),
                metadata: None,
            })
        }
    }
}

#[async_trait]
impl ToolHost for BuiltinToolHost {
    async fn execute(
        &self,
        tool_name: &str,
        arguments: Value,
        context: ToolContext,
    ) -> Result<ToolResult, DomainError> {
        match tool_name {
            "web_search" => self.exec_web_search(&arguments).await,
            "web_fetch" => self.exec_web_fetch(&arguments).await,
            "fs_read" => self.exec_fs_read(&arguments).await,
            "fs_list" => self.exec_fs_list(&arguments).await,
            "report_write" => self.exec_report_write(&arguments, &context).await,
            "report_read" => self.exec_report_read(&arguments).await,
            "report_list" => self.exec_report_list().await,
            other => Err(DomainError::NotFound {
                entity_type: "tool",
                id: other.to_string(),
            }),
        }
    }

    fn available_tools(&self, _agent_id: &str) -> Vec<ToolSchema> {
        vec![
            ToolSchema {
                name: "web_search".to_string(),
                description: "Tìm kiếm thông tin trực tiếp trên Internet qua DuckDuckGo. Trả về danh sách kết quả gồm tiêu đề, tóm tắt và đường dẫn URL.".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "query": { "type": "string", "description": "Từ khóa hoặc câu hỏi cần tìm kiếm trên Web" }
                    },
                    "required": ["query"]
                }),
            },
            ToolSchema {
                name: "web_fetch".to_string(),
                description: "Tải và đọc nội dung văn bản từ một đường dẫn URL công khai (HTTP/HTTPS). Tự động loại bỏ mã rác và chuyển đổi sang Markdown sạch.".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "url": { "type": "string", "description": "Đường dẫn URL trang web cần đọc" }
                    },
                    "required": ["url"]
                }),
            },
            ToolSchema {
                name: "fs_read".to_string(),
                description: "Đọc nội dung tệp tin văn bản từ thư mục làm việc (Workspace)".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "path": { "type": "string", "description": "Đường dẫn tương đối tới tệp tin cần đọc" }
                    },
                    "required": ["path"]
                }),
            },
            ToolSchema {
                name: "fs_list".to_string(),
                description: "Liệt kê danh sách các tệp tin trong thư mục làm việc".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "path": { "type": "string", "description": "Thư mục cần liệt kê (mặc định là thư mục gốc: '.')" }
                    }
                }),
            },
            ToolSchema {
                name: "report_write".to_string(),
                description: "Ghi hoặc tạo mới một tài liệu báo cáo nghiên cứu dạng Markdown vào thư mục reports/ trong Workspace".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "title": { "type": "string", "description": "Tiêu đề của báo cáo nghiên cứu" },
                        "content": { "type": "string", "description": "Nội dung báo cáo dạng Markdown" },
                        "filename": { "type": "string", "description": "Tên tệp tin (tùy chọn, ví dụ: 'ai-trends.md')" }
                    },
                    "required": ["title", "content"]
                }),
            },
            ToolSchema {
                name: "report_read".to_string(),
                description: "Đọc nội dung của một tài liệu báo cáo nghiên cứu từ thư mục reports/ trong Workspace".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "filename": { "type": "string", "description": "Tên tệp báo cáo cần đọc (ví dụ: 'ai-trends.md')" }
                    },
                    "required": ["filename"]
                }),
            },
            ToolSchema {
                name: "report_list".to_string(),
                description: "Liệt kê danh sách tất cả các báo cáo nghiên cứu đã lưu trong thư mục reports/".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
        ]
    }
}
