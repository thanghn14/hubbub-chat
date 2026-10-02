//! # hubbub-vault
//!
//! Secret storage via OS keyring (Windows Credential Manager) and InMemory fallback.

pub mod errors;
pub mod in_memory;
pub mod keyring_vault;

pub use errors::VaultError;
pub use in_memory::InMemoryVault;
pub use keyring_vault::KeyringVault;
