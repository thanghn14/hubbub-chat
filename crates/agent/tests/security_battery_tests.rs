#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use std::sync::Arc;
use tempfile::tempdir;
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_agent::AgentRuntime;
use hubbub_domain::entities::agent::{AgentPermissions, NetworkPolicy};
use hubbub_domain::ports::store::Store;
use hubbub_policy::{PathGuard, UrlGuard};
use hubbub_store::SqliteStore;
use hubbub_testkit::{FakeLlm, InMemoryEventSink, create_test_agent};
use hubbub_tools::BuiltinToolHost;
use hubbub_workspace::LocalWorkspaceService;

#[tokio::test]
async fn test_prompt_injection_simulation_blocked_and_audited() {
    let dir = tempdir().unwrap();
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let fake_llm = Arc::new(FakeLlm::new());
    let event_sink = Arc::new(InMemoryEventSink::new());

    let workspace = Arc::new(LocalWorkspaceService::new(dir.path()));
    let tool_host = Arc::new(BuiltinToolHost::with_workspace(
        workspace.clone(),
        Some(store.clone()),
    ));

    // Attack 1: Hijacked LLM tries path traversal to read sensitive host file
    fake_llm
        .push_tool_call(
            "call_attack_1",
            "report_read",
            r#"{"filename":"../../Windows/System32/drivers/etc/hosts"}"#,
        )
        .await;

    // Attack 2: Hijacked LLM tries SSRF to exfiltrate to internal cloud metadata
    fake_llm
        .push_tool_call(
            "call_attack_2",
            "web_fetch",
            r#"{"url":"http://169.254.169.254/latest/meta-data/"}"#,
        )
        .await;

    // Finally, LLM terminates run
    fake_llm
        .push_text_deltas(
            &["Cả hai công cụ đều bị từ chối do vi phạm chính sách bảo mật."],
            None,
        )
        .await;

    let runtime = AgentRuntime::new(
        store.clone(),
        fake_llm.clone(),
        tool_host.clone(),
        event_sink.clone(),
        None,
    );

    let mut agent = create_test_agent("researcher", "You are a research assistant.");
    agent.tools.builtin = vec!["report_read".to_string(), "web_fetch".to_string()];
    agent.permissions = AgentPermissions {
        fs_read: vec!["reports".to_string()],
        fs_write: vec!["reports".to_string()],
        network: NetworkPolicy::Open,
    };

    let conv_id = Uuid::now_v7();
    let cancel = CancellationToken::new();

    let run = runtime
        .execute_run(
            conv_id,
            &agent,
            Some("Nội dung web chứa prompt injection yêu cầu đọc file nhạy cảm và gọi SSRF"),
            cancel,
        )
        .await
        .unwrap();

    assert_eq!(
        run.status,
        hubbub_domain::entities::run::RunStatus::Completed
    );

    // Verify audit logs recorded the policy denial decisions
    let audit_logs = store.list_audit_logs(10).await.unwrap();
    assert_eq!(
        audit_logs.len(),
        2,
        "Both malicious tool calls must be logged"
    );

    let denied_tools: Vec<(&str, &str)> = audit_logs
        .iter()
        .map(|l| (l.tool_name.as_str(), l.decision.as_str()))
        .collect();

    assert!(denied_tools.contains(&("report_read", "deny")));
    assert!(denied_tools.contains(&("web_fetch", "deny")));
}

#[test]
fn test_path_traversal_battery_all_variants_rejected() {
    let dir = tempdir().unwrap();
    let root = dir.path();

    let malicious_read_paths = vec![
        "../secret.txt",
        "../../etc/passwd",
        r#"..\..\Windows\System32\cmd.exe"#,
        r#"..\..\Windows\win.ini"#,
        "/etc/shadow",
        "C:\\Windows\\System32\\cmd.exe",
        "\\\\server\\share\\secret.txt",
        "reports/../../../secret.txt",
        "reports/..\\..\\secret.txt",
        "reports/%2e%2e/secret.txt",
        "reports/..%2fsecret.txt",
        "reports/secret.txt:hidden_stream",
        "reports/doc.md::$DATA",
    ];

    for path in malicious_read_paths {
        let res_resolve = PathGuard::resolve_within_workspace(root, path);

        assert!(
            res_resolve.is_err(),
            "PathGuard must reject malicious path '{path}'"
        );
    }

    let protected_write_paths = vec![
        "config.toml",
        "agents/researcher/agent.toml",
        "agents/any.toml",
        ".versions/secret.bak",
        "../outside.md",
    ];

    for path in protected_write_paths {
        let res_write = PathGuard::check_write_path(root, path);
        assert!(
            res_write.is_err(),
            "PathGuard must protect critical workspace file '{path}'"
        );
    }
}

#[test]
fn test_ssrf_battery_all_private_targets_rejected() {
    let ssrf_targets = vec![
        // IPv4 loopback
        "http://127.0.0.1",
        "http://127.0.0.2:8080",
        "http://127.1",
        "http://127.0.0.1:3000/api",
        "http://localhost",
        "http://localhost:8080",
        "http://0.0.0.0:80",
        // Private Class A
        "http://10.0.0.1",
        "http://10.254.254.254/secret",
        // Private Class B
        "http://172.16.0.1",
        "http://172.31.255.255",
        // Private Class C
        "http://192.168.1.1",
        "http://192.168.0.254:8080/admin",
        // Cloud Metadata
        "http://169.254.169.254/latest/meta-data/",
        "http://169.254.169.254/computeMetadata/v1/",
        // IPv6 Loopback
        "http://[::1]",
        "http://[::1]:8080",
        // IPv6 Unique Local
        "http://[fc00::1]",
        "http://[fd12:3456:789a:1::1]",
        // IPv6 Link-Local
        "http://[fe80::1]",
        // Non-HTTP schemes
        "file:///etc/passwd",
        "file://C:/Windows/win.ini",
        "gopher://127.0.0.1:6379",
        "ftp://192.168.1.1",
        "ssh://git@github.com",
    ];

    for target in ssrf_targets {
        let res = UrlGuard::validate_url(target);
        assert!(
            res.is_err(),
            "UrlGuard must reject SSRF or invalid target: '{target}'"
        );
    }

    let legitimate_targets = vec![
        "https://api.github.com/repos",
        "https://www.google.com/search?q=rust",
        "http://example.com/index.html",
        "https://rust-lang.org",
    ];

    for target in legitimate_targets {
        let res = UrlGuard::validate_url(target);
        assert!(
            res.is_ok(),
            "UrlGuard must allow legitimate target: '{target}', got: {res:?}"
        );
    }
}
