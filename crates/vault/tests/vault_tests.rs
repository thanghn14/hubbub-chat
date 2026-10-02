#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use hubbub_domain::ports::secret_store::SecretStore;
use hubbub_vault::{InMemoryVault, KeyringVault, VaultError};
use std::sync::Arc;

#[tokio::test]
async fn test_in_memory_vault_crud() {
    let vault = InMemoryVault::new();

    // 1. Get non-existent
    let val = vault.get("non_existent").await.unwrap();
    assert_eq!(val, None);

    // 2. Set secret
    vault.set("openai_api_key", "sk-proj-12345").await.unwrap();
    let val = vault.get("openai_api_key").await.unwrap();
    assert_eq!(val, Some("sk-proj-12345".to_string()));

    // 3. Overwrite secret
    vault.set("openai_api_key", "sk-proj-67890").await.unwrap();
    let val = vault.get("openai_api_key").await.unwrap();
    assert_eq!(val, Some("sk-proj-67890".to_string()));

    // 4. Delete secret
    vault.delete("openai_api_key").await.unwrap();
    let val = vault.get("openai_api_key").await.unwrap();
    assert_eq!(val, None);

    // 5. Delete already deleted (idempotent)
    let del_res = vault.delete("openai_api_key").await;
    assert!(del_res.is_ok());
}

#[tokio::test]
async fn test_in_memory_vault_concurrent_access() {
    let vault = Arc::new(InMemoryVault::new());
    let mut handles = Vec::new();

    for i in 0..10 {
        let v = vault.clone();
        handles.push(tokio::spawn(async move {
            let key = format!("concurrent_key_{i}");
            let val = format!("val_{i}");
            v.set(&key, &val).await.unwrap();
            let retrieved = v.get(&key).await.unwrap();
            assert_eq!(retrieved, Some(val));
            v.delete(&key).await.unwrap();
            assert_eq!(v.get(&key).await.unwrap(), None);
        }));
    }

    for h in handles {
        h.await.unwrap();
    }
}

#[tokio::test]
async fn test_error_never_leaks_secret_value() {
    let secret_value = "SUPER_SECRET_TOKEN_NEVER_LEAK_12345";
    let key_name = "test_key";

    let err = VaultError::Keyring {
        key: key_name.to_string(),
        message: "Access Denied by OS".to_string(),
    };

    let err_str = format!("{err}");
    assert!(err_str.contains("test_key"));
    assert!(err_str.contains("Access Denied"));
    assert!(!err_str.contains(secret_value));
}

#[tokio::test]
async fn test_keyring_vault_crud_on_os() {
    let test_service = "hubbub_unit_test";
    let test_key = format!("test_key_{}", uuid::Uuid::now_v7());
    let test_secret = "test_secret_abc123!@#$%";

    let vault = KeyringVault::new(test_service);

    // Clean up first just in case
    let _ = vault.delete(&test_key).await;

    // 1. Get non-existent
    let val = vault.get(&test_key).await.unwrap();
    assert_eq!(val, None);

    // 2. Set secret
    vault.set(&test_key, test_secret).await.unwrap();

    // 3. Get secret
    let val = vault.get(&test_key).await.unwrap();
    assert_eq!(val, Some(test_secret.to_string()));

    // 4. Overwrite secret
    let updated_secret = "updated_secret_xyz789";
    vault.set(&test_key, updated_secret).await.unwrap();
    let val = vault.get(&test_key).await.unwrap();
    assert_eq!(val, Some(updated_secret.to_string()));

    // 5. Delete secret
    vault.delete(&test_key).await.unwrap();
    let val = vault.get(&test_key).await.unwrap();
    assert_eq!(val, None);

    // 6. Delete already deleted
    let del_res = vault.delete(&test_key).await;
    assert!(del_res.is_ok());
}

#[tokio::test]
async fn test_vietnamese_and_emojis_in_keyring() {
    let test_service = "hubbub_unit_test";
    let test_key = format!("khoá_test_{}", uuid::Uuid::now_v7());
    let test_secret = "Mật khẩu tiếng Việt 🇻🇳: phở gà, cà phê ☕, 100% 🚀";

    let vault = KeyringVault::new(test_service);

    // Set secret with Vietnamese and emoji
    vault.set(&test_key, test_secret).await.unwrap();

    // Get and verify
    let retrieved = vault.get(&test_key).await.unwrap();
    assert_eq!(retrieved, Some(test_secret.to_string()));

    // Clean up
    vault.delete(&test_key).await.unwrap();
    assert_eq!(vault.get(&test_key).await.unwrap(), None);
}
