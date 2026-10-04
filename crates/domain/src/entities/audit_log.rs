use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// An audit log entry recording security and tool execution events.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub run_id: Option<Uuid>,
    pub tool_name: String,
    pub args_digest: String,
    pub decision: String,
    pub result_digest: Option<String>,
}
