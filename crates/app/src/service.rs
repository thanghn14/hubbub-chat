use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use tokio_util::sync::CancellationToken;
use uuid::Uuid;

use hubbub_agent::AgentRuntime;
use hubbub_domain::entities::agent::Agent;
use hubbub_domain::entities::conversation::{Conversation, Message};
use hubbub_domain::entities::run::Run;
use hubbub_domain::ports::event_sink::EventSink;
use hubbub_domain::ports::llm::LlmProvider;
use hubbub_domain::ports::secret_store::SecretStore;
use hubbub_domain::ports::store::Store;
use hubbub_domain::ports::tool_host::ToolHost;
use hubbub_llm::{AnthropicAdapter, OpenAiCompatAdapter, ProviderConfig};
use hubbub_store::SqliteStore;
use hubbub_tools::BuiltinToolHost;
use hubbub_vault::KeyringVault;

use crate::config::AppConfig;
use crate::errors::AppError;
use crate::seed::default_agents;

pub struct AppService {
    config: AppConfig,
    store: Arc<dyn Store>,
    vault: Arc<dyn SecretStore>,
    tool_host: Arc<dyn ToolHost>,
    agents: Arc<RwLock<HashMap<String, Agent>>>,
    active_cancellations: Arc<Mutex<HashMap<Uuid, CancellationToken>>>,
}

impl AppService {
    pub fn new(
        config: AppConfig,
        store: Arc<dyn Store>,
        vault: Arc<dyn SecretStore>,
        tool_host: Arc<dyn ToolHost>,
    ) -> Self {
        let mut map = HashMap::new();
        for agent in default_agents() {
            map.insert(agent.id.clone(), agent);
        }

        Self {
            config,
            store,
            vault,
            tool_host,
            agents: Arc::new(RwLock::new(map)),
            active_cancellations: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Initialize default AppService with SQLite store and Keyring vault.
    pub async fn init(config: AppConfig) -> Result<Self, AppError> {
        let data_dir = config.workspace_dir.join("data");
        std::fs::create_dir_all(&data_dir)?;

        let db_path = data_dir.join("hubbub.db");
        let db_str = db_path.to_string_lossy().to_string();
        let store = Arc::new(SqliteStore::open(&db_str).await?);
        let vault = Arc::new(KeyringVault::new("hubbub"));
        let tool_host = Arc::new(BuiltinToolHost::new());

        let agents_path = data_dir.join("agents.json");
        let mut map = HashMap::new();
        for def in default_agents() {
            map.insert(def.id.clone(), def);
        }

        let saved_agents_opt: Option<Vec<Agent>> = std::fs::read_to_string(&agents_path)
            .ok()
            .and_then(|content| serde_json::from_str(&content).ok());
        if let Some(saved_agents) = saved_agents_opt {
            for saved in saved_agents {
                map.insert(saved.id.clone(), saved);
            }
        }

        // Migrate legacy analyst name if present
        if let Some(analyst) = map.get_mut("analyst").filter(|a| a.name == "Gemini Analyst") {
            analyst.name = "Chuyên viên Phân tích".to_string();
        }

        Ok(Self {
            config,
            store,
            vault,
            tool_host,
            agents: Arc::new(RwLock::new(map)),
            active_cancellations: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    // --- Conversation Management ---

    pub async fn create_conversation(
        &self,
        title: Option<String>,
        agent_id: Option<String>,
    ) -> Result<Conversation, AppError> {
        let agent = agent_id.unwrap_or_else(|| self.config.default_agent.clone());
        let conv = Conversation {
            id: Uuid::now_v7(),
            title: title.unwrap_or_else(|| "Cuộc trò chuyện mới".to_string()),
            agent_id: agent,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            archived: false,
        };

        self.store.create_conversation(&conv).await?;
        Ok(conv)
    }

    pub async fn list_conversations(&self) -> Result<Vec<Conversation>, AppError> {
        let list = self.store.list_conversations().await?;
        Ok(list)
    }

    pub async fn get_conversation(&self, id: Uuid) -> Result<Option<Conversation>, AppError> {
        let conv = self.store.get_conversation(id).await?;
        Ok(conv)
    }

    pub async fn list_messages(
        &self,
        conversation_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<Message>, AppError> {
        let msgs = self
            .store
            .list_messages(conversation_id, limit, offset)
            .await?;
        Ok(msgs)
    }

    // --- Secret & Provider Key Management ---

    pub async fn set_provider_key(&self, provider: &str, api_key: &str) -> Result<(), AppError> {
        let key_name = format!("{provider}_api_key");
        self.vault.set(&key_name, api_key).await?;
        Ok(())
    }

    pub async fn has_provider_key(&self, provider: &str) -> Result<bool, AppError> {
        let key_name = format!("{provider}_api_key");
        let val = self.vault.get(&key_name).await?;
        Ok(val.is_some())
    }

    pub async fn delete_provider_key(&self, provider: &str) -> Result<(), AppError> {
        let key_name = format!("{provider}_api_key");
        self.vault.delete(&key_name).await?;
        Ok(())
    }

    // --- Agents ---

    pub async fn list_agents(&self) -> Vec<Agent> {
        let map = self.agents.read().await;
        let mut list: Vec<Agent> = map.values().cloned().collect();
        list.sort_by(|a, b| a.id.cmp(&b.id));
        list
    }

    pub async fn get_agent(&self, id: &str) -> Option<Agent> {
        let map = self.agents.read().await;
        map.get(id).cloned()
    }

    pub async fn upsert_agent(&self, agent: Agent) -> Result<(), AppError> {
        {
            let mut map = self.agents.write().await;
            map.insert(agent.id.clone(), agent);
        }
        let _ = self.save_agents_to_disk().await;
        Ok(())
    }

    pub async fn set_agent_model(&self, agent_id: &str, model: &str) -> Result<(), AppError> {
        {
            let mut map = self.agents.write().await;
            if let Some(agent) = map.get_mut(agent_id) {
                agent.model = model.to_string();
            } else {
                return Err(AppError::NotFound(format!("Không tìm thấy agent: {agent_id}")));
            }
        }
        let _ = self.save_agents_to_disk().await;
        Ok(())
    }

    pub async fn delete_agent(&self, agent_id: &str) -> Result<(), AppError> {
        {
            let mut map = self.agents.write().await;
            map.remove(agent_id);
        }
        let _ = self.save_agents_to_disk().await;
        Ok(())
    }

    async fn save_agents_to_disk(&self) -> Result<(), AppError> {
        let data_dir = self.config.workspace_dir.join("data");
        if !data_dir.exists() {
            return Ok(());
        }
        let agents_path = data_dir.join("agents.json");
        let map = self.agents.read().await;
        let agents: Vec<Agent> = map.values().cloned().collect();
        let json = serde_json::to_string_pretty(&agents)
            .map_err(|e| AppError::Agent(format!("Lỗi serialize agents: {e}")))?;
        tokio::fs::write(&agents_path, json)
            .await
            .map_err(AppError::Io)?;
        Ok(())
    }

    // --- Provider Factory ---

    pub fn build_llm_provider(
        &self,
        provider_name: &str,
        api_key: Option<String>,
    ) -> Result<Arc<dyn LlmProvider>, AppError> {
        let setting =
            self.config
                .providers
                .get(provider_name)
                .ok_or_else(|| AppError::Provider {
                    provider: provider_name.to_string(),
                    message: "Cấu hình provider không tồn tại".to_string(),
                })?;

        let config = ProviderConfig {
            api_key: api_key.unwrap_or_default(),
            base_url: setting.base_url.clone(),
            timeout_s: Some(setting.timeout_s),
            max_retries: Some(setting.max_retries),
        };

        match setting.kind.as_str() {
            "openai_compat" => Ok(Arc::new(OpenAiCompatAdapter::new(config))),
            "anthropic" => Ok(Arc::new(AnthropicAdapter::new(config))),
            other => Err(AppError::Provider {
                provider: provider_name.to_string(),
                message: format!("Loại provider không được hỗ trợ: {other}"),
            }),
        }
    }

    // --- Agent Run Execution ---

    pub async fn send_message(
        &self,
        conversation_id: Uuid,
        agent_id: Option<String>,
        prompt: &str,
        event_sink: Arc<dyn EventSink>,
    ) -> Result<Run, AppError> {
        // 1. Resolve agent
        let agent_slug = agent_id.unwrap_or_else(|| self.config.default_agent.clone());
        let agent = self.get_agent(&agent_slug).await.ok_or_else(|| {
            AppError::NotFound(format!("Không tìm thấy agent với slug: {agent_slug}"))
        })?;

        // 2. Resolve provider & API key
        let provider_name = if agent.model.starts_with("claude") {
            "anthropic"
        } else if agent.model.starts_with("gemini") {
            "gemini"
        } else if agent.model.starts_with("llama") {
            if self.has_provider_key("groq").await.unwrap_or(false) {
                "groq"
            } else {
                "ollama"
            }
        } else if agent.model.starts_with("gpt")
            || agent.model.starts_with("o1")
            || agent.model.starts_with("o3")
        {
            "openai"
        } else {
            &self.config.default_provider
        };

        let key_name = format!("{provider_name}_api_key");
        let api_key = self.vault.get(&key_name).await?;

        // Require API key for cloud providers unless it's Ollama or local
        if api_key.is_none() && provider_name != "ollama" {
            return Err(AppError::Provider {
                provider: provider_name.to_string(),
                message: format!(
                    "Chưa cấu hình API key cho provider '{provider_name}'. Vui lòng cấu hình API key trong Cài đặt hoặc đổi Model của Agent sang mô hình đã có key (như gemini-3.8-flash)."
                ),
            });
        }

        let llm = self.build_llm_provider(provider_name, api_key)?;

        // 3. Setup runtime and cancellation token
        let token = CancellationToken::new();
        let runtime = AgentRuntime::new(
            self.store.clone(),
            llm,
            self.tool_host.clone(),
            event_sink,
            Some(self.config.workspace_dir.to_string_lossy().to_string()),
        );

        let run_id = Uuid::now_v7();
        {
            let mut active = self.active_cancellations.lock().await;
            active.insert(run_id, token.clone());
        }

        let exec_result = runtime
            .execute_run(conversation_id, &agent, Some(prompt), token)
            .await;

        {
            let mut active = self.active_cancellations.lock().await;
            active.remove(&run_id);
        }

        match exec_result {
            Ok(run) => Ok(run),
            Err(e) => Err(AppError::Agent(e.to_string())),
        }
    }

    pub async fn cancel_run(&self, run_id: Uuid) -> Result<bool, AppError> {
        let active = self.active_cancellations.lock().await;
        if let Some(token) = active.get(&run_id) {
            token.cancel();
            Ok(true)
        } else {
            Ok(false)
        }
    }
}
