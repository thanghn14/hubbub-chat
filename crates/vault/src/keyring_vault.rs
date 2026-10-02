use async_trait::async_trait;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::secret_store::SecretStore;
use keyring::Entry;

use crate::errors::VaultError;

pub struct KeyringVault {
    service_name: String,
}

impl Default for KeyringVault {
    fn default() -> Self {
        Self::new("hubbub")
    }
}

impl KeyringVault {
    pub fn new(service_name: impl Into<String>) -> Self {
        Self {
            service_name: service_name.into(),
        }
    }

    fn entry(&self, key: &str) -> Result<Entry, VaultError> {
        Entry::new(&self.service_name, key).map_err(|e| VaultError::Keyring {
            key: key.to_string(),
            message: e.to_string(),
        })
    }
}

#[async_trait]
impl SecretStore for KeyringVault {
    async fn set(&self, key: &str, value: &str) -> Result<(), DomainError> {
        let entry = self.entry(key)?;
        let val = value.to_string();
        let key_str = key.to_string();

        tokio::task::spawn_blocking(move || {
            entry.set_password(&val).map_err(|e| VaultError::Keyring {
                key: key_str,
                message: e.to_string(),
            })
        })
        .await
        .map_err(|e| DomainError::Internal(e.to_string()))??;

        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, DomainError> {
        let entry = self.entry(key)?;
        let key_str = key.to_string();

        let res = tokio::task::spawn_blocking(move || match entry.get_password() {
            Ok(password) => Ok(Some(password)),
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(e) => Err(VaultError::Keyring {
                key: key_str,
                message: e.to_string(),
            }),
        })
        .await
        .map_err(|e| DomainError::Internal(e.to_string()))??;

        Ok(res)
    }

    async fn delete(&self, key: &str) -> Result<(), DomainError> {
        let entry = self.entry(key)?;
        let key_str = key.to_string();

        tokio::task::spawn_blocking(move || match entry.delete_credential() {
            Ok(()) => Ok(()),
            Err(keyring::Error::NoEntry) => Ok(()),
            Err(e) => Err(VaultError::Keyring {
                key: key_str,
                message: e.to_string(),
            }),
        })
        .await
        .map_err(|e| DomainError::Internal(e.to_string()))??;

        Ok(())
    }
}
