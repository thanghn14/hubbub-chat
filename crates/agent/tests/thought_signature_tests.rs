#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::sync::Arc;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_agent::AgentRuntime;
use hubbub_agent::context::ContextBuilder;
use hubbub_domain::entities::conversation::{MessagePart, MessageRole};
use hubbub_domain::entities::run::RunStatus;
use hubbub_domain::ports::llm::{LlmChunk, ToolCall};
use hubbub_domain::ports::store::Store;
use hubbub_store::SqliteStore;
use hubbub_testkit::{FakeLlm, FakeResponse, InMemoryEventSink, MockToolHost, create_test_agent};

#[tokio::test]
async fn test_agent_runtime_preserves_thought_signature_in_store_and_context() {
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let fake_llm = Arc::new(FakeLlm::new());
    let event_sink = Arc::new(InMemoryEventSink::new());
    let tool_host = Arc::new(MockToolHost::new());

    tool_host
        .register_simple_tool("web_search", "Search web", "Found Rust info")
        .await;

    let gemini_sig = serde_json::json!({
        "google": {
            "thought_signature": "sig_cryptographic_test_888"
        }
    });

    // Step 1: LLM yields a tool call with extra_content (thought_signature)
    fake_llm
        .push_response(FakeResponse {
            chunks: vec![
                Ok(LlmChunk::ToolCall(
                    ToolCall::new("call_gemini_01", "web_search", "{\"query\":\"Rust\"}")
                        .with_extra_content(Some(gemini_sig.clone())),
                )),
                Ok(LlmChunk::Done),
            ],
            chunk_delay: None,
        })
        .await;

    // Step 2: LLM yields final text response
    fake_llm.push_text_deltas(&["Rust is great!"], None).await;

    let runtime = AgentRuntime::new(
        store.clone(),
        fake_llm.clone(),
        tool_host.clone(),
        event_sink.clone(),
        None,
    );

    let mut agent = create_test_agent("researcher", "You are a researcher.");
    agent.tools.builtin = vec!["web_search".to_string()];
    let conv_id = Uuid::now_v7();
    let cancel = CancellationToken::new();

    let run = runtime
        .execute_run(conv_id, &agent, Some("Research Rust"), cancel)
        .await
        .unwrap();

    assert_eq!(run.status, RunStatus::Completed);

    // 1. Verify Message in DB contains extra_content
    let messages = store.list_messages(conv_id, 10, 0).await.unwrap();
    // Expected messages: [User, Assistant (tool call), Tool (result), Assistant (final)]
    assert_eq!(messages.len(), 4);
    assert_eq!(messages[1].role, MessageRole::Assistant);

    let mut found_saved_sig = false;
    for part in &messages[1].parts {
        if let MessagePart::ToolCall { extra_content, .. } = part {
            assert!(extra_content.is_some());
            let val = extra_content.as_ref().unwrap();
            assert_eq!(
                val["google"]["thought_signature"],
                "sig_cryptographic_test_888"
            );
            found_saved_sig = true;
        }
    }
    assert!(
        found_saved_sig,
        "MessagePart::ToolCall must contain thought_signature"
    );

    // 2. Verify ContextBuilder reconstructs ToolCall with extra_content
    let context_messages = ContextBuilder::build(&agent, &messages, None);
    let assistant_llm_msg = context_messages
        .iter()
        .find(|m| m.role == "assistant" && m.tool_calls.is_some())
        .expect("assistant message with tool calls in context");

    let tcs = assistant_llm_msg.tool_calls.as_ref().unwrap();
    assert_eq!(tcs.len(), 1);
    assert_eq!(
        tcs[0].extra_content.as_ref().unwrap()["google"]["thought_signature"],
        "sig_cryptographic_test_888"
    );

    // 3. Verify FakeLlm recorded call in Step 2 included the assistant message with extra_content
    let recorded_calls = fake_llm.get_recorded_calls().await;
    assert_eq!(recorded_calls.len(), 2);
    let step2_input = &recorded_calls[1].messages;
    let step2_assistant_msg = step2_input
        .iter()
        .find(|m| m.role == "assistant" && m.tool_calls.is_some())
        .expect("step 2 input has assistant tool call");

    let step2_tc = &step2_assistant_msg.tool_calls.as_ref().unwrap()[0];
    assert_eq!(
        step2_tc.extra_content.as_ref().unwrap()["google"]["thought_signature"],
        "sig_cryptographic_test_888"
    );
}
