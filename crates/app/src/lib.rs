//! # hubbub-app
//!
//! Composition root, use-case facades, configuration, and service coordinator.

pub mod config;
pub mod errors;
pub mod provider_factory;
pub mod seed;
pub mod service;

pub use config::{AppConfig, ProviderSettings};
pub use errors::AppError;
pub use provider_factory::ProviderFactory;
pub use seed::default_agents;
pub use service::AppService;
