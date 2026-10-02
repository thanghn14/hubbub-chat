use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A document managed in the workspace.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: Uuid,
    pub path: String,
    pub title: String,
    pub tags: Vec<String>,
    pub agent_id: Option<String>,
    pub run_id: Option<Uuid>,
    pub content_hash: String,
    pub size_bytes: u64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
