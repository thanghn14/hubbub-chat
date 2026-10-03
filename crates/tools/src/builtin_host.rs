//! Built-in tool host connecting agents to tools.

use async_trait::async_trait;
use serde_json::Value;

use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::ToolSchema;
use hubbub_domain::ports::tool_host::{ToolContext, ToolHost, ToolResult};

use crate::web_fetch::WebFetchTool;
use crate::web_search::WebSearchTool;

pub struct BuiltinToolHost {
    web_search: WebSearchTool,
    web_fetch: WebFetchTool,
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
        }
    }
}

#[async_trait]
impl ToolHost for BuiltinToolHost {
    async fn execute(
        &self,
        tool_name: &str,
        arguments: Value,
        _context: ToolContext,
    ) -> Result<ToolResult, DomainError> {
        match tool_name {
            "web_search" => {
                let query = arguments
                    .get("query")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .trim();

                if query.is_empty() {
                    return Ok(ToolResult {
                        success: false,
                        content: "Lỗi: Tham số 'query' không được để trống khi tìm kiếm web.".to_string(),
                        metadata: None,
                    });
                }

                match self.web_search.search(query).await {
                    Ok(content) => Ok(ToolResult {
                        success: true,
                        content,
                        metadata: None,
                    }),
                    Err(e) => Ok(ToolResult {
                        success: false,
                        content: format!("Lỗi tìm kiếm web: {e}"),
                        metadata: None,
                    }),
                }
            }

            "web_fetch" => {
                let url = arguments
                    .get("url")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .trim();

                if url.is_empty() {
                    return Ok(ToolResult {
                        success: false,
                        content: "Lỗi: Tham số 'url' không được để trống khi truy cập web.".to_string(),
                        metadata: None,
                    });
                }

                match self.web_fetch.fetch(url).await {
                    Ok(content) => Ok(ToolResult {
                        success: true,
                        content,
                        metadata: None,
                    }),
                    Err(e) => Ok(ToolResult {
                        success: false,
                        content: format!("Lỗi truy cập trang web: {e}"),
                        metadata: None,
                    }),
                }
            }

            "fs_read" => Ok(ToolResult {
                success: true,
                content: "Filesystem read tool ready.".to_string(),
                metadata: None,
            }),

            "fs_list" => Ok(ToolResult {
                success: true,
                content: "Filesystem list tool ready.".to_string(),
                metadata: None,
            }),

            "report_write" => Ok(ToolResult {
                success: true,
                content: "Report write tool ready.".to_string(),
                metadata: None,
            }),

            "report_read" => Ok(ToolResult {
                success: true,
                content: "Report read tool ready.".to_string(),
                metadata: None,
            }),

            "report_list" => Ok(ToolResult {
                success: true,
                content: "Report list tool ready.".to_string(),
                metadata: None,
            }),

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
                description: "Đọc nội dung tệp tin từ thư mục làm việc (Workspace)".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "path": { "type": "string", "description": "Đường dẫn tương đối tới tệp cần đọc" }
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
                        "path": { "type": "string", "description": "Thư mục cần liệt kê (mặc định là thư mục gốc)" }
                    }
                }),
            },
            ToolSchema {
                name: "report_write".to_string(),
                description: "Ghi hoặc tạo mới một tài liệu báo cáo Markdown vào thư mục reports/".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "title": { "type": "string", "description": "Tiêu đề báo cáo" },
                        "content": { "type": "string", "description": "Nội dung báo cáo dạng Markdown" }
                    },
                    "required": ["title", "content"]
                }),
            },
            ToolSchema {
                name: "report_read".to_string(),
                description: "Đọc nội dung của một tài liệu báo cáo từ thư mục reports/".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "filename": { "type": "string", "description": "Tên tệp báo cáo cần đọc" }
                    },
                    "required": ["filename"]
                }),
            },
            ToolSchema {
                name: "report_list".to_string(),
                description: "Liệt kê danh sách tất cả các báo cáo đã lưu trong reports/".to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
        ]
    }
}
