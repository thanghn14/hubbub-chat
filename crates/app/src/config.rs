use crate::errors::AppError;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub workspace_dir: PathBuf,
    pub default_provider: String,
    pub default_agent: String,
    pub providers: HashMap<String, ProviderSettings>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderSettings {
    pub kind: String, // "openai_compat" or "anthropic"
    pub base_url: Option<String>,
    pub default_model: String,
    pub timeout_s: u64,
    pub max_retries: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        let mut providers = HashMap::new();

        providers.insert(
            "openai".to_string(),
            ProviderSettings {
                kind: "openai_compat".to_string(),
                base_url: None, // defaults to https://api.openai.com/v1
                default_model: "gpt-4o-mini".to_string(),
                timeout_s: 60,
                max_retries: 2,
            },
        );

        providers.insert(
            "anthropic".to_string(),
            ProviderSettings {
                kind: "anthropic".to_string(),
                base_url: None, // defaults to https://api.anthropic.com
                default_model: "claude-sonnet-4-20250514".to_string(),
                timeout_s: 60,
                max_retries: 2,
            },
        );

        providers.insert(
            "ollama".to_string(),
            ProviderSettings {
                kind: "openai_compat".to_string(),
                base_url: Some("http://localhost:11434/v1".to_string()),
                default_model: "llama3.2".to_string(),
                timeout_s: 120,
                max_retries: 1,
            },
        );

        providers.insert(
            "openrouter".to_string(),
            ProviderSettings {
                kind: "openai_compat".to_string(),
                base_url: Some("https://openrouter.ai/api/v1".to_string()),
                default_model: "anthropic/claude-3.5-sonnet".to_string(),
                timeout_s: 60,
                max_retries: 2,
            },
        );

        providers.insert(
            "groq".to_string(),
            ProviderSettings {
                kind: "openai_compat".to_string(),
                base_url: Some("https://api.groq.com/openai/v1".to_string()),
                default_model: "llama-3.3-70b-versatile".to_string(),
                timeout_s: 60,
                max_retries: 2,
            },
        );

        Self {
            workspace_dir: PathBuf::from("./workspace"),
            default_provider: "openai".to_string(),
            default_agent: "researcher".to_string(),
            providers,
        }
    }
}

impl AppConfig {
    pub fn load_from_path(path: &Path) -> Result<Self, AppError> {
        if !path.exists() {
            let default_config = Self::default();
            default_config.save_to_path(path)?;
            return Ok(default_config);
        }

        let content = std::fs::read_to_string(path)?;
        let config: AppConfig = toml::from_str(&content)
            .map_err(|e| AppError::Config(format!("Failed to parse config file: {e}")))?;
        Ok(config)
    }

    pub fn save_to_path(&self, path: &Path) -> Result<(), AppError> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let content = toml::to_string_pretty(self)
            .map_err(|e| AppError::Config(format!("Failed to serialize config: {e}")))?;
        std::fs::write(path, content)?;
        Ok(())
    }
}
