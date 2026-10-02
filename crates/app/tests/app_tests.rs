#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use hubbub_app::{AppConfig, AppError, AppService};
use hubbub_store::SqliteStore;
use hubbub_testkit::MockToolHost;
use hubbub_vault::InMemoryVault;
use std::sync::Arc;
use tempfile::NamedTempFile;

#[tokio::test]
async fn test_app_config_load_and_save() {
    let tmp_file = NamedTempFile::new().unwrap();
    let path = tmp_file.path().to_path_buf();

    let config = AppConfig {
        default_provider: "anthropic".to_string(),
        default_agent: "librarian".to_string(),
        ..Default::default()
    };

    config.save_to_path(&path).unwrap();

    let loaded = AppConfig::load_from_path(&path).unwrap();
    assert_eq!(loaded.default_provider, "anthropic");
    assert_eq!(loaded.default_agent, "librarian");
    assert!(loaded.providers.contains_key("openai"));
    assert!(loaded.providers.contains_key("anthropic"));
    assert!(loaded.providers.contains_key("ollama"));
}

#[tokio::test]
async fn test_app_service_conversation_lifecycle() {
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let vault = Arc::new(InMemoryVault::new());
    let tool_host = Arc::new(MockToolHost::new());
    let config = AppConfig::default();

    let service = AppService::new(config, store.clone(), vault, tool_host);

    // 1. Create conversation with Vietnamese title
    let conv = service
        .create_conversation(
            Some("Nghiên cứu thị trường AI Việt Nam 🇻🇳".to_string()),
            Some("researcher".to_string()),
        )
        .await
        .unwrap();

    assert_eq!(conv.title, "Nghiên cứu thị trường AI Việt Nam 🇻🇳");
    assert_eq!(conv.agent_id, "researcher");

    // 2. List conversations
    let list = service.list_conversations().await.unwrap();
    assert_eq!(list.len(), 1);
    assert_eq!(list[0].id, conv.id);

    // 3. Get conversation
    let retrieved = service.get_conversation(conv.id).await.unwrap();
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap().id, conv.id);
}

#[tokio::test]
async fn test_app_service_secret_management() {
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let vault = Arc::new(InMemoryVault::new());
    let tool_host = Arc::new(MockToolHost::new());
    let config = AppConfig::default();

    let service = AppService::new(config, store, vault, tool_host);

    // Initially no key
    assert!(!service.has_provider_key("openai").await.unwrap());

    // Set key
    service
        .set_provider_key("openai", "sk-proj-secret-12345")
        .await
        .unwrap();
    assert!(service.has_provider_key("openai").await.unwrap());

    // Delete key
    service.delete_provider_key("openai").await.unwrap();
    assert!(!service.has_provider_key("openai").await.unwrap());
}

#[tokio::test]
async fn test_app_service_agents() {
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let vault = Arc::new(InMemoryVault::new());
    let tool_host = Arc::new(MockToolHost::new());
    let config = AppConfig::default();

    let service = AppService::new(config, store, vault, tool_host);

    let agents = service.list_agents().await;
    assert!(agents.len() >= 3);

    let researcher = service.get_agent("researcher").await;
    assert!(researcher.is_some());
    let r = researcher.unwrap();
    assert_eq!(r.id, "researcher");
    assert!(r.tools.builtin.contains(&"web_search".to_string()));
}

#[tokio::test]
async fn test_app_service_build_llm_provider() {
    let store = Arc::new(SqliteStore::open_in_memory().await.unwrap());
    let vault = Arc::new(InMemoryVault::new());
    let tool_host = Arc::new(MockToolHost::new());
    let config = AppConfig::default();

    let service = AppService::new(config, store, vault, tool_host);

    let openai_provider = service.build_llm_provider("openai", Some("sk-test".to_string()));
    assert!(openai_provider.is_ok());

    let anthropic_provider =
        service.build_llm_provider("anthropic", Some("sk-ant-test".to_string()));
    assert!(anthropic_provider.is_ok());

    let unknown_provider = service.build_llm_provider("unknown_provider", None);
    match unknown_provider {
        Err(AppError::Provider { provider, .. }) => assert_eq!(provider, "unknown_provider"),
        Ok(_) => panic!("Expected Err(AppError::Provider), got Ok"),
        Err(other) => panic!("Expected AppError::Provider, got {other:?}"),
    }
}
