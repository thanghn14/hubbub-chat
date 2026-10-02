use async_trait::async_trait;
use serde_json::Value;
use std::collections::{BTreeMap, VecDeque};

use crate::config::ProviderConfig;
use crate::errors::LlmError;
use crate::sse::SseEventReader;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::{
    LlmChunk, LlmConfig, LlmMessage, LlmProvider, LlmStream, LlmUsage, ToolCall, ToolSchema,
};

pub struct OpenAiCompatAdapter {
    config: ProviderConfig,
    client: reqwest::Client,
}

impl OpenAiCompatAdapter {
    pub fn new(config: ProviderConfig) -> Self {
        let timeout = config.timeout();
        let client = reqwest::Client::builder()
            .timeout(timeout)
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self { config, client }
    }

    fn build_endpoint(&self) -> String {
        let base = self
            .config
            .base_url
            .as_deref()
            .unwrap_or("https://api.openai.com/v1");

        let trimmed = base.trim_end_matches('/');
        if trimmed.ends_with("/chat/completions") {
            trimmed.to_string()
        } else {
            format!("{trimmed}/chat/completions")
        }
    }
}

#[async_trait]
impl LlmProvider for OpenAiCompatAdapter {
    async fn chat_stream(
        &self,
        messages: Vec<LlmMessage>,
        tools: Vec<ToolSchema>,
        config: LlmConfig,
    ) -> Result<Box<dyn LlmStream>, DomainError> {
        let endpoint = self.build_endpoint();

        // Convert messages to OpenAI JSON format
        let openai_messages: Vec<Value> = messages
            .into_iter()
            .map(|m| {
                let mut obj = serde_json::json!({
                    "role": m.role,
                    "content": m.content,
                });
                if let Some(tool_calls) = m.tool_calls {
                    let tc_val: Vec<Value> = tool_calls
                        .into_iter()
                        .map(|tc| {
                            serde_json::json!({
                                "id": tc.id,
                                "type": "function",
                                "function": {
                                    "name": tc.name,
                                    "arguments": tc.arguments,
                                }
                            })
                        })
                        .collect();
                    obj["tool_calls"] = Value::Array(tc_val);
                }
                if let Some(tcid) = m.tool_call_id {
                    obj["tool_call_id"] = Value::String(tcid);
                }
                obj
            })
            .collect();

        let mut payload = serde_json::json!({
            "model": config.model,
            "messages": openai_messages,
            "stream": true,
            "stream_options": { "include_usage": true },
        });

        if let Some(max_tokens) = config.max_tokens {
            payload["max_tokens"] = serde_json::json!(max_tokens);
        }
        if let Some(temp) = config.temperature {
            payload["temperature"] = serde_json::json!(temp);
        }

        if !tools.is_empty() {
            let tools_val: Vec<Value> = tools
                .into_iter()
                .map(|t| {
                    serde_json::json!({
                        "type": "function",
                        "function": {
                            "name": t.name,
                            "description": t.description,
                            "parameters": t.parameters,
                        }
                    })
                })
                .collect();
            payload["tools"] = Value::Array(tools_val);
        }

        // Retry loop
        let max_retries = self.config.max_retries();
        let mut attempt = 0;

        loop {
            attempt += 1;
            let req = self
                .client
                .post(&endpoint)
                .header("authorization", format!("Bearer {}", self.config.api_key))
                .header("content-type", "application/json")
                .json(&payload);

            let res = req.send().await;

            match res {
                Ok(resp) => {
                    let status = resp.status();
                    if status.is_success() {
                        return Ok(Box::new(OpenAiStream::new(resp)));
                    } else if (status.is_server_error()
                        || status == reqwest::StatusCode::TOO_MANY_REQUESTS)
                        && attempt <= max_retries
                    {
                        tokio::time::sleep(std::time::Duration::from_millis(
                            50 * (1 << (attempt - 1)),
                        ))
                        .await;
                        continue;
                    } else {
                        let err_text = resp.text().await.unwrap_or_default();
                        return Err(LlmError::Api {
                            status: status.as_u16(),
                            message: err_text,
                        }
                        .into());
                    }
                }
                Err(_e) if attempt <= max_retries => {
                    tokio::time::sleep(std::time::Duration::from_millis(50 * (1 << (attempt - 1))))
                        .await;
                    continue;
                }
                Err(e) => return Err(LlmError::Http(e).into()),
            }
        }
    }
}

pub struct OpenAiStream {
    reader: SseEventReader,
    accumulated_tool_calls: BTreeMap<usize, ToolCall>,
    pending_chunks: VecDeque<LlmChunk>,
    finished: bool,
}

impl OpenAiStream {
    pub fn new(response: reqwest::Response) -> Self {
        Self {
            reader: SseEventReader::new(response),
            accumulated_tool_calls: BTreeMap::new(),
            pending_chunks: VecDeque::new(),
            finished: false,
        }
    }

    fn flush_tool_calls(&mut self) {
        for (_, tc) in std::mem::take(&mut self.accumulated_tool_calls) {
            self.pending_chunks.push_back(LlmChunk::ToolCall(tc));
        }
    }
}

#[async_trait]
impl LlmStream for OpenAiStream {
    async fn next(&mut self) -> Option<Result<LlmChunk, DomainError>> {
        if let Some(chunk) = self.pending_chunks.pop_front() {
            return Some(Ok(chunk));
        }

        if self.finished {
            return None;
        }

        loop {
            match self.reader.next_event().await {
                Ok(Some(event)) => {
                    if event.data == "[DONE]" {
                        self.flush_tool_calls();
                        self.pending_chunks.push_back(LlmChunk::Done);
                        self.finished = true;
                        return self.pending_chunks.pop_front().map(Ok);
                    }

                    // Parse JSON payload
                    let Ok(parsed): Result<Value, _> = serde_json::from_str(&event.data) else {
                        // Skip malformed JSON lines
                        continue;
                    };

                    // Check top-level usage (e.g. from stream_options)
                    if let Some((pt, ct)) = parsed.get("usage").and_then(|u| {
                        Some((
                            u.get("prompt_tokens")?.as_u64()?,
                            u.get("completion_tokens")?.as_u64()?,
                        ))
                    }) {
                        return Some(Ok(LlmChunk::Usage(LlmUsage {
                            prompt_tokens: pt,
                            completion_tokens: ct,
                        })));
                    }

                    // Check choices[0]
                    if let Some(choice) = parsed.get("choices").and_then(|c| c.get(0)) {
                        if let Some(delta) = choice.get("delta") {
                            // 1. Text Delta
                            if let Some(content) = delta
                                .get("content")
                                .and_then(Value::as_str)
                                .filter(|c| !c.is_empty())
                            {
                                return Some(Ok(LlmChunk::Delta(content.to_string())));
                            }

                            // 2. Tool calls delta
                            if let Some(tcs) = delta.get("tool_calls").and_then(Value::as_array) {
                                for tc in tcs {
                                    let idx = tc.get("index").and_then(Value::as_u64).unwrap_or(0)
                                        as usize;

                                    let entry = self
                                        .accumulated_tool_calls
                                        .entry(idx)
                                        .or_insert_with(|| ToolCall {
                                            id: String::new(),
                                            name: String::new(),
                                            arguments: String::new(),
                                        });

                                    if let Some(id) = tc.get("id").and_then(Value::as_str) {
                                        entry.id = id.to_string();
                                    }

                                    if let Some(func) = tc.get("function") {
                                        if let Some(name) = func.get("name").and_then(Value::as_str)
                                        {
                                            entry.name = name.to_string();
                                        }
                                        if let Some(args) =
                                            func.get("arguments").and_then(Value::as_str)
                                        {
                                            entry.arguments.push_str(args);
                                        }
                                    }
                                }
                            }
                        }

                        // Check finish reason
                        if choice.get("finish_reason").and_then(Value::as_str) == Some("tool_calls")
                        {
                            self.flush_tool_calls();
                            if let Some(chunk) = self.pending_chunks.pop_front() {
                                return Some(Ok(chunk));
                            }
                        }
                    }
                }
                Ok(None) => {
                    self.flush_tool_calls();
                    if !self.finished {
                        self.pending_chunks.push_back(LlmChunk::Done);
                        self.finished = true;
                    }
                    return self.pending_chunks.pop_front().map(Ok);
                }
                Err(e) => return Some(Err(e.into())),
            }
        }
    }
}
