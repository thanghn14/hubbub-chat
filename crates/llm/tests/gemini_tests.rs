#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use wiremock::matchers::{body_json, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

use hubbub_domain::ports::llm::{
    LlmChunk, LlmConfig, LlmMessage, LlmProvider, ToolCall,
};
use hubbub_llm::{OpenAiCompatAdapter, ProviderConfig};

#[tokio::test]
async fn test_openai_stream_gemini_thought_signature_preservation() {
    let mock_server = MockServer::start().await;

    let sse_body = "data: {\"choices\":[{\"delta\":{\"tool_calls\":[{\"index\":0,\"id\":\"call_gemini_1\",\"type\":\"function\",\"function\":{\"name\":\"web_search\",\"arguments\":\"{\\\"query\\\": \\\"Rust\\\"}\"},\"extra_content\":{\"google\":{\"thought_signature\":\"sig_test_123\"}}}]}}]}\n\n\
                    data: [DONE]\n\n";

    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string(sse_body),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "dummy".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let mut stream = adapter
        .chat_stream(
            vec![LlmMessage {
                role: "user".to_string(),
                content: "Search for Rust".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "gemini-3.8-flash".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let mut tool_calls = vec![];

    while let Some(chunk_res) = stream.next().await {
        let chunk = chunk_res.expect("chunk ok");
        if let LlmChunk::ToolCall(tc) = chunk {
            tool_calls.push(tc);
        }
    }

    assert_eq!(tool_calls.len(), 1);
    assert_eq!(tool_calls[0].name, "web_search");
    assert_eq!(tool_calls[0].id, "call_gemini_1");
    let extra = tool_calls[0].extra_content.as_ref().expect("extra_content present");
    assert_eq!(
        extra["google"]["thought_signature"],
        "sig_test_123"
    );
}

#[tokio::test]
async fn test_openai_stream_gemini_direct_thought_signature() {
    let mock_server = MockServer::start().await;

    let sse_body = "data: {\"choices\":[{\"delta\":{\"tool_calls\":[{\"index\":0,\"id\":\"call_2\",\"type\":\"function\",\"function\":{\"name\":\"calc\",\"arguments\":\"{}\"},\"thought_signature\":\"sig_direct_999\"}]}}]}\n\n\
                    data: [DONE]\n\n";

    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string(sse_body),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "dummy".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let mut stream = adapter
        .chat_stream(
            vec![LlmMessage {
                role: "user".to_string(),
                content: "calculate".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "gemini-3.8-flash".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let mut tool_calls = vec![];

    while let Some(chunk_res) = stream.next().await {
        let chunk = chunk_res.expect("chunk ok");
        if let LlmChunk::ToolCall(tc) = chunk {
            tool_calls.push(tc);
        }
    }

    assert_eq!(tool_calls.len(), 1);
    let extra = tool_calls[0].extra_content.as_ref().expect("extra_content present");
    assert_eq!(
        extra["google"]["thought_signature"],
        "sig_direct_999"
    );
}

#[tokio::test]
async fn test_gemini_request_thought_signature_roundtrip() {
    let mock_server = MockServer::start().await;

    let expected_extra = serde_json::json!({
        "google": {
            "thought_signature": "sig_roundtrip_456"
        }
    });

    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .and(body_json(serde_json::json!({
            "model": "gemini-3.8-flash",
            "messages": [
                {
                    "role": "user",
                    "content": "Hi"
                },
                {
                    "role": "assistant",
                    "content": "",
                    "tool_calls": [
                        {
                            "id": "call_1",
                            "type": "function",
                            "function": {
                                "name": "web_search",
                                "arguments": "{\"query\":\"test\"}"
                            },
                            "extra_content": {
                                "google": {
                                    "thought_signature": "sig_roundtrip_456"
                                }
                            }
                        }
                    ]
                },
                {
                    "role": "tool",
                    "content": "Search results",
                    "tool_call_id": "call_1"
                }
            ],
            "stream": true,
            "stream_options": { "include_usage": true }
        })))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string("data: [DONE]\n\n"),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "dummy".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let messages = vec![
        LlmMessage {
            role: "user".to_string(),
            content: "Hi".to_string(),
            tool_calls: None,
            tool_call_id: None,
        },
        LlmMessage {
            role: "assistant".to_string(),
            content: String::new(),
            tool_calls: Some(vec![ToolCall::new(
                "call_1",
                "web_search",
                "{\"query\":\"test\"}",
            )
            .with_extra_content(Some(expected_extra))]),
            tool_call_id: None,
        },
        LlmMessage {
            role: "tool".to_string(),
            content: "Search results".to_string(),
            tool_calls: None,
            tool_call_id: Some("call_1".to_string()),
        },
    ];

    let mut stream = adapter
        .chat_stream(
            messages,
            vec![],
            LlmConfig {
                model: "gemini-3.8-flash".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let _ = stream.next().await;
}

#[tokio::test]
async fn test_gemini_request_fallback_sentinel_when_missing() {
    let mock_server = MockServer::start().await;

    // Notice: input has tool_call with NO extra_content.
    // Because target model is "gemini-3.8-flash", the adapter must automatically
    // inject the official sentinel "skip_thought_signature_validator".
    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .and(body_json(serde_json::json!({
            "model": "gemini-3.8-flash",
            "messages": [
                {
                    "role": "assistant",
                    "content": "",
                    "tool_calls": [
                        {
                            "id": "legacy_call_001",
                            "type": "function",
                            "function": {
                                "name": "web_search",
                                "arguments": "{}"
                            },
                            "extra_content": {
                                "google": {
                                    "thought_signature": "skip_thought_signature_validator"
                                }
                            }
                        }
                    ]
                }
            ],
            "stream": true,
            "stream_options": { "include_usage": true }
        })))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string("data: [DONE]\n\n"),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "dummy".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let messages = vec![LlmMessage {
        role: "assistant".to_string(),
        content: String::new(),
        tool_calls: Some(vec![ToolCall::new("legacy_call_001", "web_search", "{}")]),
        tool_call_id: None,
    }];

    let mut stream = adapter
        .chat_stream(
            messages,
            vec![],
            LlmConfig {
                model: "gemini-3.8-flash".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let _ = stream.next().await;
}

#[tokio::test]
async fn test_non_gemini_request_omits_sentinel_when_missing() {
    let mock_server = MockServer::start().await;

    // For non-Gemini models (like gpt-4o), extra_content is NOT injected.
    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .and(body_json(serde_json::json!({
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "assistant",
                    "content": "",
                    "tool_calls": [
                        {
                            "id": "openai_call_001",
                            "type": "function",
                            "function": {
                                "name": "calc",
                                "arguments": "{}"
                            }
                        }
                    ]
                }
            ],
            "stream": true,
            "stream_options": { "include_usage": true }
        })))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string("data: [DONE]\n\n"),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "dummy".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let messages = vec![LlmMessage {
        role: "assistant".to_string(),
        content: String::new(),
        tool_calls: Some(vec![ToolCall::new("openai_call_001", "calc", "{}")]),
        tool_call_id: None,
    }];

    let mut stream = adapter
        .chat_stream(
            messages,
            vec![],
            LlmConfig {
                model: "gpt-4o".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let _ = stream.next().await;
}
