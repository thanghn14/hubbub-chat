//! LLM provider factory for instantiating concrete LLM adapters.

use std::sync::Arc;
use hubbub_domain::ports::llm::LlmProvider;
use hubbub_llm::{AnthropicAdapter, OpenAiCompatAdapter, ProviderConfig};

use crate::config::AppConfig;
use crate::errors::AppError;

pub struct ProviderFactory;

impl ProviderFactory {
    pub fn build(
        config: &AppConfig,
        provider_name: &str,
        api_key: Option<String>,
    ) -> Result<Arc<dyn LlmProvider>, AppError> {
        let setting = config
            .providers
            .get(provider_name)
            .ok_or_else(|| AppError::Provider {
                provider: provider_name.to_string(),
                message: "Cấu hình provider không tồn tại".to_string(),
            })?;

        let prov_config = ProviderConfig {
            api_key: api_key.unwrap_or_default(),
            base_url: setting.base_url.clone(),
            timeout_s: Some(setting.timeout_s),
            max_retries: Some(setting.max_retries),
        };

        match setting.kind.as_str() {
            "openai_compat" => Ok(Arc::new(OpenAiCompatAdapter::new(prov_config))),
            "anthropic" => Ok(Arc::new(AnthropicAdapter::new(prov_config))),
            other => Err(AppError::Provider {
                provider: provider_name.to_string(),
                message: format!("Loại provider không được hỗ trợ: {other}"),
            }),
        }
    }
}
