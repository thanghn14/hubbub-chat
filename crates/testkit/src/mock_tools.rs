use async_trait::async_trait;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::ToolSchema;
use hubbub_domain::ports::tool_host::{ToolContext, ToolHost, ToolResult};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

type ToolHandler =
    Arc<dyn Fn(Value, ToolContext) -> Result<ToolResult, DomainError> + Send + Sync + 'static>;

#[derive(Clone)]
struct RegisteredTool {
    schema: ToolSchema,
    handler: ToolHandler,
    delay: Option<Duration>,
}

#[derive(Debug, Clone)]
pub struct RecordedToolCall {
    pub tool_name: String,
    pub arguments: Value,
    pub context: ToolContext,
}

#[derive(Default)]
pub struct MockToolHost {
    tools: Arc<Mutex<HashMap<String, RegisteredTool>>>,
    recorded_calls: Arc<Mutex<Vec<RecordedToolCall>>>,
}

impl MockToolHost {
    pub fn new() -> Self {
        Self {
            tools: Arc::new(Mutex::new(HashMap::new())),
            recorded_calls: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Register a tool with a custom handler closure.
    pub async fn register_tool<F>(&self, schema: ToolSchema, delay: Option<Duration>, handler: F)
    where
        F: Fn(Value, ToolContext) -> Result<ToolResult, DomainError> + Send + Sync + 'static,
    {
        let mut tools = self.tools.lock().await;
        let name = schema.name.clone();
        tools.insert(
            name,
            RegisteredTool {
                schema,
                handler: Arc::new(handler),
                delay,
            },
        );
    }

    /// Register a simple tool returning static text.
    pub async fn register_simple_tool(&self, name: &str, description: &str, result_content: &str) {
        let content = result_content.to_string();
        self.register_tool(
            ToolSchema {
                name: name.to_string(),
                description: description.to_string(),
                parameters: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
            None,
            move |_args, _ctx| {
                Ok(ToolResult {
                    success: true,
                    content: content.clone(),
                    metadata: None,
                })
            },
        )
        .await;
    }

    /// Get all recorded tool calls.
    pub async fn get_recorded_calls(&self) -> Vec<RecordedToolCall> {
        let calls = self.recorded_calls.lock().await;
        calls.clone()
    }
}

#[async_trait]
impl ToolHost for MockToolHost {
    async fn execute(
        &self,
        tool_name: &str,
        arguments: Value,
        context: ToolContext,
    ) -> Result<ToolResult, DomainError> {
        {
            let mut calls = self.recorded_calls.lock().await;
            calls.push(RecordedToolCall {
                tool_name: tool_name.to_string(),
                arguments: arguments.clone(),
                context: context.clone(),
            });
        }

        let registered = {
            let tools = self.tools.lock().await;
            tools
                .get(tool_name)
                .cloned()
                .ok_or_else(|| DomainError::NotFound {
                    entity_type: "tool",
                    id: tool_name.to_string(),
                })?
        };

        if let Some(d) = registered.delay {
            tokio::time::sleep(d).await;
        }

        (registered.handler)(arguments, context)
    }

    fn available_tools(&self, _agent_id: &str) -> Vec<ToolSchema> {
        match self.tools.try_lock() {
            Ok(tools) => tools.values().map(|t| t.schema.clone()).collect(),
            Err(_) => Vec::new(),
        }
    }
}
