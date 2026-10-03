use hubbub_domain::ports::llm::{LlmChunk, LlmConfig, LlmMessage, LlmProvider};
use hubbub_llm::{OpenAiCompatAdapter, ProviderConfig};
use wiremock::matchers::{method, path};
use wiremock::{Mock, MockServer, ResponseTemplate};

#[tokio::test]
async fn test_gemini_stream_with_usage_and_content_in_same_chunk()
-> Result<(), Box<dyn std::error::Error>> {
    let mock_server = MockServer::start().await;

    // Google Gemini sends usage in every chunk alongside delta content
    let sse_body = "data: {\"choices\":[{\"delta\":{\"content\":\"Xin chào \",\"role\":\"assistant\"},\"index\":0}],\"usage\":{\"completion_tokens\":2,\"prompt_tokens\":8,\"total_tokens\":10}}\n\n\
                    data: {\"choices\":[{\"delta\":{\"content\":\"từ Gemini!\",\"role\":\"assistant\"},\"index\":0}],\"usage\":{\"completion_tokens\":5,\"prompt_tokens\":8,\"total_tokens\":13}}\n\n\
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
        api_key: "dummy-key".to_string(),
        base_url: Some(mock_server.uri()),
        timeout_s: Some(5),
        max_retries: Some(1),
    };

    let adapter = OpenAiCompatAdapter::new(config);

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
                model: "gemini-3.8-flash".to_string(),
                max_tokens: None,
                temperature: None,
            },
        )
        .await?;

    let mut collected_text = String::new();
    let mut final_prompt_tokens = 0;
    let mut final_completion_tokens = 0;
    let mut got_done = false;

    while let Some(chunk_res) = stream.next().await {
        let chunk = chunk_res?;
        match chunk {
            LlmChunk::Delta(delta) => collected_text.push_str(&delta),
            LlmChunk::Usage(usage) => {
                final_prompt_tokens = usage.prompt_tokens;
                final_completion_tokens = usage.completion_tokens;
            }
            LlmChunk::Done => {
                got_done = true;
                break;
            }
            _ => {}
        }
    }

    assert_eq!(collected_text, "Xin chào từ Gemini!");
    assert_eq!(final_prompt_tokens, 8);
    assert_eq!(final_completion_tokens, 5);
    assert!(got_done);
    Ok(())
}
