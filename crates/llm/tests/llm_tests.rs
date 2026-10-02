#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use hubbub_domain::ports::llm::{LlmChunk, LlmConfig, LlmMessage, LlmProvider, ToolSchema};
use hubbub_llm::{AnthropicAdapter, OpenAiCompatAdapter, ProviderConfig};
use wiremock::matchers::{header, method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

#[tokio::test]
async fn test_openai_stream_text_deltas_and_done() {
    let mock_server = MockServer::start().await;

    let sse_body = "data: {\"choices\":[{\"delta\":{\"content\":\"Xin \"}}]}\n\n\
                    data: {\"choices\":[{\"delta\":{\"content\":\"chào \"}}]}\n\n\
                    data: {\"choices\":[{\"delta\":{\"content\":\"Hubbub!\"}}]}\n\n\
                    data: [DONE]\n\n";

    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .and(header("authorization", "Bearer test-key"))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string(sse_body),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "test-key".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let messages = vec![LlmMessage {
        role: "user".to_string(),
        content: "Hello".to_string(),
        tool_calls: None,
        tool_call_id: None,
    }];

    let llm_config = LlmConfig {
        model: "gpt-4o".to_string(),
        max_tokens: Some(100),
        temperature: Some(0.7),
    };

    let mut stream = adapter
        .chat_stream(messages, vec![], llm_config)
        .await
        .expect("chat_stream should succeed");

    let mut collected_text = String::new();
    let mut got_done = false;

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.expect("chunk should be ok");
        match chunk {
            LlmChunk::Delta(text) => collected_text.push_str(&text),
            LlmChunk::Done => {
                got_done = true;
                break;
            }
            _ => {}
        }
    }

    assert_eq!(collected_text, "Xin chào Hubbub!");
    assert!(got_done);
}

#[tokio::test]
async fn test_openai_stream_with_usage() {
    let mock_server = MockServer::start().await;

    let sse_body = "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n\n\
                    data: {\"choices\":[],\"usage\":{\"prompt_tokens\":25,\"completion_tokens\":10}}\n\n\
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
                content: "Hi".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "gpt-4o".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let mut prompt_tokens = 0;
    let mut completion_tokens = 0;

    while let Some(chunk_res) = stream.next().await {
        let chunk = chunk_res.expect("chunk ok");
        if let LlmChunk::Usage(usage) = chunk {
            prompt_tokens = usage.prompt_tokens;
            completion_tokens = usage.completion_tokens;
        }
    }

    assert_eq!(prompt_tokens, 25);
    assert_eq!(completion_tokens, 10);
}

#[tokio::test]
async fn test_openai_stream_tool_calls() {
    let mock_server = MockServer::start().await;

    let sse_body = "data: {\"choices\":[{\"delta\":{\"tool_calls\":[{\"index\":0,\"id\":\"call_1\",\"type\":\"function\",\"function\":{\"name\":\"web_search\",\"arguments\":\"{\\\"query\\\": \\\"\"}}]}}]}\n\n\
                    data: {\"choices\":[{\"delta\":{\"tool_calls\":[{\"index\":0,\"function\":{\"arguments\":\"Rust lang\"}}]}}]}\n\n\
                    data: {\"choices\":[{\"delta\":{\"tool_calls\":[{\"index\":0,\"function\":{\"arguments\":\"\\\"}\"}}]}}]}\n\n\
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

    let tools = vec![ToolSchema {
        name: "web_search".to_string(),
        description: "Search web".to_string(),
        parameters: serde_json::json!({
            "type": "object",
            "properties": {
                "query": {"type": "string"}
            }
        }),
    }];

    let mut stream = adapter
        .chat_stream(
            vec![LlmMessage {
                role: "user".to_string(),
                content: "Search for Rust".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            tools,
            LlmConfig {
                model: "gpt-4o".to_string(),
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
    assert_eq!(tool_calls[0].arguments, "{\"query\": \"Rust lang\"}");
}

#[tokio::test]
async fn test_anthropic_stream_text_deltas_and_usage() {
    let mock_server = MockServer::start().await;

    let sse_body = "event: message_start\n\
                    data: {\"type\":\"message_start\",\"message\":{\"id\":\"msg_1\",\"usage\":{\"input_tokens\":40,\"output_tokens\":2}}}\n\n\
                    event: content_block_delta\n\
                    data: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"Xin chào từ Claude\"}}\n\n\
                    event: message_delta\n\
                    data: {\"type\":\"message_delta\",\"delta\":{\"stop_reason\":\"end_turn\"},\"usage\":{\"output_tokens\":18}}\n\n\
                    event: message_stop\n\
                    data: {\"type\":\"message_stop\"}\n\n";

    Mock::given(method("POST"))
        .and(path("/v1/messages"))
        .and(header("x-api-key", "claude-key"))
        .and(header("anthropic-version", "2023-06-01"))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string(sse_body),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "claude-key".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = AnthropicAdapter::new(config);

    let mut stream = adapter
        .chat_stream(
            vec![LlmMessage {
                role: "user".to_string(),
                content: "Chào bạn".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "claude-3-5-sonnet-20241022".to_string(),
                max_tokens: Some(500),
                temperature: None,
            },
        )
        .await
        .expect("anthropic stream started");

    let mut text = String::new();
    let mut total_tokens = 0;

    while let Some(chunk_res) = stream.next().await {
        let chunk = chunk_res.expect("chunk ok");
        match chunk {
            LlmChunk::Delta(d) => text.push_str(&d),
            LlmChunk::Usage(u) => total_tokens = u.prompt_tokens + u.completion_tokens,
            _ => {}
        }
    }

    assert_eq!(text, "Xin chào từ Claude");
    assert_eq!(total_tokens, 40 + 18);
}

#[tokio::test]
async fn test_retry_on_500_server_error() {
    let mock_server = MockServer::start().await;

    // Fail first request with 500, succeed on second with 200
    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .respond_with(ResponseTemplate::new(500).set_body_string("Internal Server Error"))
        .up_to_n_times(1)
        .mount(&mock_server)
        .await;

    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("content-type", "text/event-stream")
                .set_body_string("data: {\"choices\":[{\"delta\":{\"content\":\"Thành công!\"}}]}\n\ndata: [DONE]\n\n"),
        )
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "dummy".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(2),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let mut stream = adapter
        .chat_stream(
            vec![LlmMessage {
                role: "user".to_string(),
                content: "Test retry".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "gpt-4o".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("should succeed after retry");

    let chunk = stream.next().await.expect("some chunk").expect("chunk ok");
    match chunk {
        LlmChunk::Delta(t) => assert_eq!(t, "Thành công!"),
        _ => panic!("Expected Delta"),
    }
}

#[tokio::test]
async fn test_auth_error_no_retry() {
    let mock_server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/chat/completions"))
        .respond_with(
            ResponseTemplate::new(401)
                .set_body_string("{\"error\": {\"message\": \"Invalid API key\"}}"),
        )
        .expect(1) // Should NOT retry 401
        .mount(&mock_server)
        .await;

    let config = ProviderConfig {
        api_key: "invalid-key".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(3),
    };

    let adapter = OpenAiCompatAdapter::new(config);

    let result = adapter
        .chat_stream(
            vec![LlmMessage {
                role: "user".to_string(),
                content: "Hi".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "gpt-4o".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await;

    assert!(result.is_err());
    let err_msg = result.err().unwrap().to_string();
    assert!(err_msg.contains("Invalid API key") || err_msg.contains("401"));
}

#[tokio::test]
async fn test_malformed_json_in_sse_stream() {
    let mock_server = MockServer::start().await;

    let sse_body = "data: {\"choices\":[{\"delta\":{\"content\":\"Valid 1\"}}]}\n\n\
                    data: {MALFORMED JSON LINE GARBAGE}\n\n\
                    data: {\"choices\":[{\"delta\":{\"content\":\" Valid 2\"}}]}\n\n\
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
                content: "Hi".to_string(),
                tool_calls: None,
                tool_call_id: None,
            }],
            vec![],
            LlmConfig {
                model: "gpt-4o".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await
        .expect("stream started");

    let mut text = String::new();
    while let Some(chunk_res) = stream.next().await {
        // Robustness: malformed lines should be skipped or gracefully handled
        if let Ok(LlmChunk::Delta(d)) = chunk_res {
            text.push_str(&d);
        }
    }

    assert_eq!(text, "Valid 1 Valid 2");
}
