#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::sync::Arc;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_agent::AgentRuntime;
use hubbub_domain::entities::conversation::MessagePart;
use hubbub_domain::entities::run::RunStatus;
use hubbub_domain::ports::llm::{LlmChunk, LlmUsage};
use hubbub_domain::ports::store::Store;
use hubbub_store::SqliteStore;
use hubbub_testkit::{FakeLlm, FakeResponse, InMemoryEventSink, MockToolHost, create_test_agent};

#[tokio::test]
async fn test_automatic_continuation_on_length_truncation() {
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let fake_llm = Arc::new(FakeLlm::new());
    let event_sink = Arc::new(InMemoryEventSink::new());
    let tool_host = Arc::new(MockToolHost::new());

    // 1. First turn: hits length limit mid-sentence
    fake_llm
        .push_response(FakeResponse {
            chunks: vec![
                Ok(LlmChunk::Delta(
                    "Đây là phần đầu của câu trả lời dài và bị ngắt ở đâ".to_string(),
                )),
                Ok(LlmChunk::Usage(LlmUsage {
                    prompt_tokens: 20,
                    completion_tokens: 15,
                })),
                Ok(LlmChunk::FinishReason("length".to_string())),
                Ok(LlmChunk::Done),
            ],
            chunk_delay: None,
        })
        .await;

    // 2. Second turn: automatic continuation finishes cleanly
    fake_llm
        .push_response(FakeResponse {
            chunks: vec![
                Ok(LlmChunk::Delta(
                    "y, nhưng sau đó tự động tiếp tục cho đến khi kết thúc hoàn chỉnh.".to_string(),
                )),
                Ok(LlmChunk::Usage(LlmUsage {
                    prompt_tokens: 35,
                    completion_tokens: 20,
                })),
                Ok(LlmChunk::FinishReason("stop".to_string())),
                Ok(LlmChunk::Done),
            ],
            chunk_delay: None,
        })
        .await;

    let runtime = AgentRuntime::new(
        store.clone(),
        fake_llm.clone(),
        tool_host.clone(),
        event_sink.clone(),
        None,
    );

    let agent = create_test_agent("test-agent", "Trợ lý luôn trả lời đầy đủ.");
    let conv_id = Uuid::now_v7();
    let cancel = CancellationToken::new();

    let run = runtime
        .execute_run(conv_id, &agent, Some("Giải thích chi tiết"), cancel)
        .await
        .unwrap();

    assert_eq!(run.status, RunStatus::Completed);

    // Verify stream events combined seamlessly
    let expected_full_text = "Đây là phần đầu của câu trả lời dài và bị ngắt ở đây, nhưng sau đó tự động tiếp tục cho đến khi kết thúc hoàn chỉnh.";
    assert_eq!(event_sink.full_text().await, expected_full_text);

    // Verify database stored the complete concatenated message
    let messages = store.list_messages(conv_id, 10, 0).await.unwrap();
    assert_eq!(messages.len(), 2);
    let assistant_msg = &messages[1];
    match &assistant_msg.parts[0] {
        MessagePart::Text(t) => assert_eq!(t, expected_full_text),
        _ => panic!("Expected Text message part"),
    }
}
