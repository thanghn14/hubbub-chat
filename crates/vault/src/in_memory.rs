use async_trait::async_trait;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::secret_store::SecretStore;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Default, Clone)]
pub struct InMemoryVault {
    secrets: Arc<RwLock<HashMap<String, String>>>,
}

impl InMemoryVault {
    pub fn new() -> Self {
        Self {
            secrets: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl SecretStore for InMemoryVault {
    async fn set(&self, key: &str, value: &str) -> Result<(), DomainError> {
        let mut map = self.secrets.write().await;
        map.insert(key.to_string(), value.to_string());
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, DomainError> {
        let map = self.secrets.read().await;
        Ok(map.get(key).cloned())
    }

    async fn delete(&self, key: &str) -> Result<(), DomainError> {
        let mut map = self.secrets.write().await;
        map.remove(key);
        Ok(())
    }
}
