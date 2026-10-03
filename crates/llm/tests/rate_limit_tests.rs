#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use hubbub_llm::errors::{extract_retry_delay, format_api_error};
use reqwest::header::{HeaderMap, HeaderValue, RETRY_AFTER};
use std::time::Duration;

#[test]
fn test_extract_retry_delay_from_gemini_error_body() {
    let headers = HeaderMap::new();
    let body = r#"{
      "error": {
        "code": 429,
        "message": "You exceeded your current quota... Please retry in 25.447400747s.",
        "status": "RESOURCE_EXHAUSTED",
        "details": [
          {
            "@type": "type.googleapis.com/google.rpc.RetryInfo",
            "retryDelay": "25s"
          }
        ]
      }
    }"#;

    let delay = extract_retry_delay(&headers, body);
    assert!(delay.is_some());
    let dur = delay.unwrap();
    // 25s parsed from retryDelay
    assert_eq!(dur, Duration::from_secs(25));
}

#[test]
fn test_extract_retry_delay_from_header() {
    let mut headers = HeaderMap::new();
    headers.insert(RETRY_AFTER, HeaderValue::from_static("18"));
    let body = "Rate limit exceeded";

    let delay = extract_retry_delay(&headers, body);
    assert_eq!(delay, Some(Duration::from_secs(18)));
}

#[test]
fn test_format_api_error_for_429() {
    let body = r#"{
      "error": {
        "code": 429,
        "message": "You exceeded your current quota... Please retry in 25.4s.",
        "status": "RESOURCE_EXHAUSTED"
      }
    }"#;

    let formatted = format_api_error(429, body, "gemini-3.8-flash");
    assert!(formatted.contains("Hạn mức yêu cầu miễn phí"));
    assert!(formatted.contains("gemini-3.8-flash"));
    assert!(formatted.contains("25.4s"));
    assert!(formatted.contains("gemini-2.5-flash"));
}
