//! Domain events emitted during agent runs.

use serde::{Deserialize, Serialize};

/// Events emitted during an agent run, streamed to the UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum RunEvent {
    /// Incremental text from the LLM.
    MessageDelta { content: String },

    /// A tool execution has started.
    ToolStarted { tool_name: String, args_preview: String },

    /// User approval is required to proceed.
    ApprovalRequired {
        approval_id: String,
        tool_name: String,
        description: String,
    },

    /// A tool execution has completed.
    ToolFinished {
        tool_name: String,
        success: bool,
        summary: String,
    },

    /// The run has completed.
    RunFinished { run_id: String, status: String },

    /// An error occurred during the run.
    Error { message: String, recoverable: bool },

    /// Documents in the workspace have changed.
    DocumentsChanged { paths: Vec<String> },
}
