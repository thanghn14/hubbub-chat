//! # hubbub-tools
//!
//! Built-in tool implementations and host for Hubbub agents.

pub mod builtin_host;
pub mod errors;
pub mod web_fetch;
pub mod web_search;

pub use builtin_host::BuiltinToolHost;
pub use errors::ToolError;
pub use web_fetch::WebFetchTool;
pub use web_search::WebSearchTool;
