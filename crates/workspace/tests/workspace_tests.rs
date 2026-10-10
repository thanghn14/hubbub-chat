#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use hubbub_domain::ports::workspace_service::WorkspaceService;
use hubbub_workspace::LocalWorkspaceService;
use tempfile::tempdir;

#[tokio::test]
async fn test_atomic_write_and_read_vietnamese_and_emojis() {
    let dir = tempdir().unwrap();
    let service = LocalWorkspaceService::new(dir.path());

    let path = "reports/báo cáo tổng kết 2026.md";
    let content = "# Báo cáo Nghiên cứu Trí tuệ Nhân tạo 🚀\n\nNội dung có dấu tiếng Việt: ắ, ằ, ẳ, ẵ, ặ, ế, ề, ể, ễ, ệ.\n";

    service.write_file(path, content).await.unwrap();

    let read_back = service.read_file(path).await.unwrap();
    assert_eq!(read_back, content);
}

#[tokio::test]
async fn test_file_not_found_returns_domain_not_found() {
    let dir = tempdir().unwrap();
    let service = LocalWorkspaceService::new(dir.path());

    let res = service.read_file("non_existent.md").await;
    assert!(res.is_err());
    match res.unwrap_err() {
        hubbub_domain::errors::DomainError::NotFound { entity_type, id } => {
            assert_eq!(entity_type, "file");
            assert_eq!(id, "non_existent.md");
        }
        other => panic!("Expected NotFound, got: {other:?}"),
    }
}

#[tokio::test]
async fn test_auto_versioning_on_overwrite() {
    let dir = tempdir().unwrap();
    let service = LocalWorkspaceService::new(dir.path());

    let path = "reports/draft.md";
    service.write_file(path, "Phiên bản 1").await.unwrap();

    // Small delay to ensure timestamp differs
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
    service.write_file(path, "Phiên bản 2").await.unwrap();

    let current = service.read_file(path).await.unwrap();
    assert_eq!(current, "Phiên bản 2");

    let versions_dir = dir.path().join(".versions");
    assert!(versions_dir.exists());

    let mut count = 0;
    let mut read_dir = tokio::fs::read_dir(&versions_dir).await.unwrap();
    while let Some(entry) = read_dir.next_entry().await.unwrap() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.contains("reports_draft.md") && name.ends_with(".bak") {
            count += 1;
            let old_content = tokio::fs::read_to_string(entry.path()).await.unwrap();
            assert_eq!(old_content, "Phiên bản 1");
        }
    }
    assert_eq!(count, 1);
}

#[tokio::test]
async fn test_max_file_size_rejection() {
    let dir = tempdir().unwrap();
    // 100 bytes limit
    let service = LocalWorkspaceService::with_max_file_size(dir.path(), 100);

    let path = "large_file.txt";
    let content = "A".repeat(200);
    service.write_file(path, &content).await.unwrap();

    let res = service.read_file(path).await;
    assert!(res.is_err());
    let err = res.unwrap_err();
    assert!(format!("{err}").contains("File too large"));
}

#[tokio::test]
async fn test_path_guard_rejects_traversal() {
    let dir = tempdir().unwrap();
    let service = LocalWorkspaceService::new(dir.path());

    let res = service.write_file("../../outside.txt", "hacked").await;
    assert!(res.is_err());

    let res_read = service.read_file("../escape.txt").await;
    assert!(res_read.is_err());
}

#[tokio::test]
async fn test_protected_paths_cannot_be_overwritten() {
    let dir = tempdir().unwrap();
    let service = LocalWorkspaceService::new(dir.path());

    let res_config = service.write_file("config.toml", "malicious_config").await;
    assert!(res_config.is_err());

    let res_agent = service
        .write_file("agents/analyst/agent.toml", "malicious_agent")
        .await;
    assert!(res_agent.is_err());

    let res_versions = service.write_file(".versions/fake.bak", "tamper").await;
    assert!(res_versions.is_err());
}

#[tokio::test]
async fn test_list_files_and_reindex() {
    let dir = tempdir().unwrap();
    let service = LocalWorkspaceService::new(dir.path());

    service
        .write_file(
            "reports/báo cáo A.md",
            "# Báo cáo Khảo sát Thị trường\n\nNội dung A",
        )
        .await
        .unwrap();
    service
        .write_file(
            "reports/báo cáo B.md",
            "# Phân tích Kỹ thuật 2026\n\nNội dung B",
        )
        .await
        .unwrap();
    service
        .write_file("notes/ghi chú.txt", "Note 1")
        .await
        .unwrap();

    let reports = service.list_files("reports").await.unwrap();
    assert_eq!(reports.len(), 2);
    assert_eq!(reports[0], "reports/báo cáo A.md");
    assert_eq!(reports[1], "reports/báo cáo B.md");

    let doc = service.reindex_file("reports/báo cáo A.md").await.unwrap();
    assert!(doc.is_some());
    let doc = doc.unwrap();
    assert_eq!(doc.title, "Báo cáo Khảo sát Thị trường");
    assert_eq!(doc.path, "reports/báo cáo A.md");
    assert!(!doc.content_hash.is_empty());
}

struct TestSink {
    tx: tokio::sync::mpsc::Sender<hubbub_domain::entities::document::Document>,
}

impl hubbub_workspace::WorkspaceWatcherSink for TestSink {
    fn on_document_indexed(&self, doc: hubbub_domain::entities::document::Document) {
        let _ = self.tx.try_send(doc);
    }
}

#[tokio::test]
async fn test_watcher_detects_external_file_modification_and_reindexes() {
    let dir = tempdir().unwrap();
    let service = std::sync::Arc::new(LocalWorkspaceService::new(dir.path()));
    let (tx, mut rx) = tokio::sync::mpsc::channel(10);
    let sink = std::sync::Arc::new(TestSink { tx });

    let watcher =
        hubbub_workspace::WorkspaceWatcher::start(dir.path(), service.clone(), sink).unwrap();

    let reports_dir = dir.path().join("reports");
    tokio::fs::create_dir_all(&reports_dir).await.unwrap();

    // Simulate external edit (outside LocalWorkspaceService)
    let file_path = reports_dir.join("external_report.md");
    tokio::fs::write(
        &file_path,
        "# Báo cáo Từ Bên Ngoài\n\nNội dung tự sửa bằng text editor",
    )
    .await
    .unwrap();

    let received = tokio::time::timeout(tokio::time::Duration::from_secs(3), rx.recv()).await;
    assert!(received.is_ok(), "Timed out waiting for watcher event");
    let doc = received.unwrap().unwrap();
    assert_eq!(doc.title, "Báo cáo Từ Bên Ngoài");
    assert_eq!(doc.path, "reports/external_report.md");

    watcher.stop().await;
}

#[tokio::test]
async fn test_watcher_ignores_self_writes() {
    let dir = tempdir().unwrap();
    let service = std::sync::Arc::new(LocalWorkspaceService::new(dir.path()));
    let (tx, mut rx) = tokio::sync::mpsc::channel(10);
    let sink = std::sync::Arc::new(TestSink { tx });

    let watcher =
        hubbub_workspace::WorkspaceWatcher::start(dir.path(), service.clone(), sink).unwrap();

    // App self-write via service.write_file
    service
        .write_file("reports/internal_report.md", "# Báo cáo Nội Bộ")
        .await
        .unwrap();

    // Watcher should ignore self write because it's recorded in service.self_writes
    let received = tokio::time::timeout(tokio::time::Duration::from_millis(500), rx.recv()).await;
    assert!(received.is_err(), "Watcher should ignore self-writes!");

    watcher.stop().await;
}
