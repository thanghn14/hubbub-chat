#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::sync::Arc;
use tempfile::tempdir;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_agent::AgentRuntime;
use hubbub_domain::entities::agent::{
    Agent, AgentBudget, AgentDelegation, AgentPermissions, AgentTools, NetworkPolicy,
};
use hubbub_domain::entities::conversation::Conversation;
use hubbub_domain::ports::llm::{LlmChunk, ToolCall};
use hubbub_domain::ports::store::Store;
use hubbub_domain::ports::workspace_service::WorkspaceService;
use hubbub_store::SqliteStore;
use hubbub_testkit::{FakeLlm, FakeResponse, InMemoryEventSink};
use hubbub_tools::BuiltinToolHost;
use hubbub_workspace::LocalWorkspaceService;

#[tokio::test]
async fn test_agent_executes_report_write_and_fs_read() {
    let ws_dir = tempdir().unwrap();
    let ws = Arc::new(LocalWorkspaceService::new(ws_dir.path()));
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let host = Arc::new(BuiltinToolHost::with_workspace(ws.clone(), Some(store.clone())));
    let sink = Arc::new(InMemoryEventSink::new());

    let agent = Agent {
        id: "writer".to_string(),
        name: "Biên tập & Soạn thảo".to_string(),
        model: "fake".to_string(),
        system_prompt: "You write reports.".to_string(),
        tools: AgentTools {
            builtin: vec![
                "report_write".to_string(),
                "report_read".to_string(),
                "fs_read".to_string(),
            ],
            mcp: vec![],
        },
        permissions: AgentPermissions {
            fs_read: vec!["reports/**".to_string()],
            fs_write: vec!["reports/**".to_string()],
            network: NetworkPolicy::None,
        },
        budget: AgentBudget {
            max_steps: 10,
            max_tokens: 50_000,
            max_cost_usd: 0.1,
            timeout_s: 60,
        },
        delegation: AgentDelegation {
            can_delegate_to: vec![],
        },
        version: 1,
    };

    let conv = Conversation {
        id: Uuid::now_v7(),
        title: "Tạo báo cáo thử nghiệm".to_string(),
        agent_id: agent.id.clone(),
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        archived: false,
    };
    store.create_conversation(&conv).await.unwrap();

    let fake_llm = Arc::new(FakeLlm::new());

    // Turn 1: LLM calls report_write
    fake_llm
        .push_response(FakeResponse {
            chunks: vec![
                Ok(LlmChunk::ToolCall(ToolCall {
                    id: "call_report_write_1".to_string(),
                    name: "report_write".to_string(),
                    arguments: serde_json::to_string(&serde_json::json!({
                        "title": "Báo cáo Kiểm thử Tự động",
                        "content": "Đây là nội dung báo cáo nghiên cứu do Agent tạo ra.",
                        "filename": "auto-test.md"
                    }))
                    .unwrap(),
                    extra_content: None,
                })),
                Ok(LlmChunk::Done),
            ],
            chunk_delay: None,
        })
        .await;

    // Turn 2: LLM receives tool result and concludes
    fake_llm
        .push_response(FakeResponse {
            chunks: vec![
                Ok(LlmChunk::Delta("Tôi đã lưu xong báo cáo vào hệ thống.".to_string())),
                Ok(LlmChunk::Done),
            ],
            chunk_delay: None,
        })
        .await;

    let runtime = AgentRuntime::new(
        store.clone(),
        fake_llm,
        host,
        sink,
        Some(ws_dir.path().to_string_lossy().to_string()),
    );

    let run = runtime
        .execute_run(
            conv.id,
            &agent,
            Some("Hãy viết cho tôi một báo cáo thử nghiệm"),
            CancellationToken::new(),
        )
        .await
        .unwrap();

    assert_eq!(run.status, hubbub_domain::entities::run::RunStatus::Completed);

    // Verify file exists on disk
    let report_content = ws.read_file("reports/auto-test.md").await.unwrap();
    assert!(report_content.contains("Báo cáo Kiểm thử Tự động"));
    assert!(report_content.contains("Đây là nội dung báo cáo nghiên cứu do Agent tạo ra."));

    // Verify document was indexed into SQLite store
    let docs = store.list_documents().await.unwrap();
    assert_eq!(docs.len(), 1);
    assert_eq!(docs[0].path, "reports/auto-test.md");
    assert_eq!(docs[0].title, "Báo cáo Kiểm thử Tự động");
    assert_eq!(docs[0].agent_id.as_deref(), Some("writer"));
}
