//! # hubbub-tools
//!
//! Built-in tool implementations and host for Hubbub agents.

pub mod builtin_host;
pub mod errors;
pub mod fs_list;
pub mod fs_read;
pub mod report_list;
pub mod report_read;
pub mod report_write;
pub mod web_fetch;
pub mod web_search;

pub use builtin_host::BuiltinToolHost;
pub use errors::ToolError;
pub use fs_list::FsListTool;
pub use fs_read::FsReadTool;
pub use report_list::ReportListTool;
pub use report_read::ReportReadTool;
pub use report_write::ReportWriteTool;
pub use web_fetch::WebFetchTool;
pub use web_search::WebSearchTool;
