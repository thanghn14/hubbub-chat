use std::time::Duration;
use hubbub_domain::errors::DomainError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum LlmError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("API error ({status}): {message}")]
    Api { status: u16, message: String },

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Request timed out: {0}")]
    Timeout(String),

    #[error("Stream error: {0}")]
    Stream(String),
}

impl From<LlmError> for DomainError {
    fn from(err: LlmError) -> Self {
        match err {
            LlmError::Api { status, message } => {
                if status == 401 || status == 403 {
                    DomainError::PermissionDenied(format!(
                        "Authentication failed ({status}): {message}"
                    ))
                } else if status == 400 {
                    DomainError::Validation(message)
                } else if status == 429 {
                    DomainError::Internal(format!("Rate limit (429): {message}"))
                } else {
                    DomainError::Internal(format!("API error ({status}): {message}"))
                }
            }
            LlmError::Timeout(msg) => DomainError::Internal(format!("Timeout: {msg}")),
            other => DomainError::Internal(other.to_string()),
        }
    }
}

/// Extract recommended retry delay from HTTP headers or response body.
pub fn extract_retry_delay(
    headers: &reqwest::header::HeaderMap,
    body: &str,
) -> Option<Duration> {
    // 1. Check Retry-After header (seconds)
    if let Some(val) = headers
        .get(reqwest::header::RETRY_AFTER)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.trim().parse::<u64>().ok())
    {
        return Some(Duration::from_secs(val));
    }

    // 2. Parse from JSON body
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(body) {
        // Check details array for retryDelay
        if let Some(details) = val.pointer("/error/details").and_then(|d| d.as_array()) {
            for item in details {
                if let Some(delay_str) = item.get("retryDelay").and_then(|v| v.as_str()) {
                    let clean = delay_str.trim_end_matches('s').trim();
                    if let Ok(secs) = clean.parse::<f64>() {
                        return Some(Duration::from_millis((secs.ceil() * 1000.0) as u64));
                    }
                }
            }
        }

        // Check message for "retry in "
        if let Some(sub) = val
            .pointer("/error/message")
            .and_then(|m| m.as_str())
            .and_then(|msg| msg.find("retry in ").map(|idx| &msg[idx + "retry in ".len()..]))
        {
            let num_str: String = sub
                .chars()
                .take_while(|c| c.is_ascii_digit() || *c == '.')
                .collect();
            if let Ok(secs) = num_str.parse::<f64>() {
                return Some(Duration::from_millis((secs.ceil() * 1000.0) as u64));
            }
        }
    }

    None
}

/// Format API error into a friendly, clear message for end users.
pub fn format_api_error(status: u16, raw_body: &str, model: &str) -> String {
    if status == 429 {
        let wait_note = serde_json::from_str::<serde_json::Value>(raw_body)
            .ok()
            .as_ref()
            .and_then(|v| v.pointer("/error/message"))
            .and_then(|m| m.as_str())
            .and_then(|msg| {
                msg.find("retry in ").map(|idx| {
                    let sub = &msg[idx + "retry in ".len()..];
                    let num: String = sub
                        .chars()
                        .take_while(|c| c.is_ascii_digit() || *c == '.')
                        .collect();
                    if num.is_empty() {
                        String::new()
                    } else {
                        format!(" (Vui lòng đợi khoảng {num}s trước khi gửi tiếp)")
                    }
                })
            })
            .unwrap_or_default();

        return format!(
            "Hạn mức yêu cầu miễn phí (Free Tier Rate Limit) của mô hình '{model}' đã bị vượt quá{wait_note}. \
            Bạn có thể đợi một chút để quota hồi phục, hoặc đổi Agent sang mô hình khác (như gemini-2.5-flash)."
        );
    }

    // Try to extract a clean message field from JSON
    if let Some(msg) = serde_json::from_str::<serde_json::Value>(raw_body)
        .ok()
        .as_ref()
        .and_then(|val| val.pointer("/error/message"))
        .and_then(|m| m.as_str())
    {
        return msg.to_string();
    }

    raw_body.to_string()
}
