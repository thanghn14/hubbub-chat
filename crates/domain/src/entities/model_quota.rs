use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Aggregated usage statistics and quota tracking for an AI model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelUsageStat {
    pub model: String,
    pub provider: String,
    pub total_prompt_tokens: u64,
    pub total_completion_tokens: u64,
    pub total_tokens: u64,
    pub total_runs: u64,
    pub total_cost_usd: f64,
    pub requests_today: u64,
    pub tokens_today: u64,
    pub rpm_limit: u32,
    pub rpd_limit: u32,
    pub is_free_tier: bool,
    pub last_used_at: Option<DateTime<Utc>>,
}

/// Known quota limits for popular AI models.
pub fn get_default_quota_for_model(model: &str) -> (String, u32, u32, bool) {
    if model.starts_with("gemini-3.8") || model.starts_with("gemini-2") || model.starts_with("gemini-1.5-flash") {
        ("gemini".to_string(), 15, 1500, true)
    } else if model.starts_with("gemini-1.5-pro") {
        ("gemini".to_string(), 2, 50, true)
    } else if model.starts_with("claude") {
        ("anthropic".to_string(), 50, 5000, false)
    } else if model.starts_with("gpt-4o-mini") {
        ("openai".to_string(), 500, 10000, false)
    } else if model.starts_with("gpt-4o") || model.starts_with("o1") || model.starts_with("o3") {
        ("openai".to_string(), 500, 5000, false)
    } else if model.starts_with("llama") && model.contains("versatile") {
        ("groq".to_string(), 30, 14400, true)
    } else if model.starts_with("llama") {
        ("ollama".to_string(), 0, 0, false) // 0 means unlimited local
    } else {
        ("openai".to_string(), 60, 2000, false)
    }
}
