//! # hubbub-app
//!
//! Composition root, use-case facades, configuration, and service coordinator.

pub mod config;
pub mod errors;
pub mod seed;
pub mod service;

pub use config::{AppConfig, ProviderSettings};
pub use errors::AppError;
pub use seed::default_agents;
pub use service::AppService;
