use serde::{Deserialize, Serialize};

/// Configuration for an LLM provider connection.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    /// Secret API key (bearer token or header).
    pub api_key: String,

    /// Optional base URL override (e.g. `http://localhost:11434/v1` for Ollama).
    pub base_url: Option<String>,

    /// Request timeout in seconds (default 60s).
    pub timeout_s: Option<u64>,

    /// Maximum retry attempts on 5xx or connection drops (default 2).
    pub max_retries: Option<u32>,
}

impl ProviderConfig {
    pub fn timeout(&self) -> std::time::Duration {
        std::time::Duration::from_secs(self.timeout_s.unwrap_or(60))
    }

    pub fn max_retries(&self) -> u32 {
        self.max_retries.unwrap_or(2)
    }
}
