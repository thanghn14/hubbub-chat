use async_trait::async_trait;
use serde_json::Value;
use std::collections::{BTreeMap, VecDeque};

use crate::config::ProviderConfig;
use crate::errors::{LlmError, extract_retry_delay, format_api_error};
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
        let is_gemini = config.model.to_lowercase().contains("gemini")
            || self
                .config
                .base_url
                .as_deref()
                .unwrap_or("")
                .contains("googleapis.com");

        let openai_messages = build_openai_messages(messages, is_gemini);

        let mut payload = serde_json::json!({
            "model": config.model,
            "messages": openai_messages,
            "stream": true,
            "stream_options": { "include_usage": true },
        });

        if let Some(max_tokens) = config.max_tokens {
            let cap = if is_gemini { 8192 } else { 16384 };
            let clamped = max_tokens.min(cap);
            payload["max_tokens"] = serde_json::json!(clamped);
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
                    }

                    let headers = resp.headers().clone();
                    let err_text = resp.text().await.unwrap_or_default();

                    if status == reqwest::StatusCode::TOO_MANY_REQUESTS && attempt <= max_retries {
                        let delay = extract_retry_delay(&headers, &err_text).unwrap_or_else(|| {
                            std::time::Duration::from_millis(1000 * (1 << (attempt - 1)))
                        });
                        if delay <= std::time::Duration::from_secs(35) {
                            tracing::warn!(
                                "Hit 429 rate limit (attempt {attempt}/{max_retries}). Sleeping {delay:?} before retry..."
                            );
                            tokio::time::sleep(delay + std::time::Duration::from_millis(500)).await;
                            continue;
                        }
                    } else if status.is_server_error() && attempt <= max_retries {
                        tokio::time::sleep(std::time::Duration::from_millis(
                            200 * (1 << (attempt - 1)),
                        ))
                        .await;
                        continue;
                    }

                    let message = format_api_error(status.as_u16(), &err_text, &config.model);
                    return Err(LlmError::Api {
                        status: status.as_u16(),
                        message,
                    }
                    .into());
                }
                Err(_e) if attempt <= max_retries => {
                    tokio::time::sleep(std::time::Duration::from_millis(
                        200 * (1 << (attempt - 1)),
                    ))
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
    last_usage: Option<LlmUsage>,
    pending_chunks: VecDeque<LlmChunk>,
    finished: bool,
}

impl OpenAiStream {
    pub fn new(response: reqwest::Response) -> Self {
        Self {
            reader: SseEventReader::new(response),
            accumulated_tool_calls: BTreeMap::new(),
            last_usage: None,
            pending_chunks: VecDeque::new(),
            finished: false,
        }
    }

    fn flush_tool_calls(&mut self) {
        for (_, tc) in std::mem::take(&mut self.accumulated_tool_calls) {
            self.pending_chunks.push_back(LlmChunk::ToolCall(tc));
        }
    }

    fn finish_stream(&mut self) {
        if !self.finished {
            self.flush_tool_calls();
            if let Some(usage) = self.last_usage.take() {
                self.pending_chunks.push_back(LlmChunk::Usage(usage));
            }
            self.pending_chunks.push_back(LlmChunk::Done);
            self.finished = true;
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
                        self.finish_stream();
                        return self.pending_chunks.pop_front().map(Ok);
                    }

                    // Parse JSON payload
                    let Ok(parsed): Result<Value, _> = serde_json::from_str(&event.data) else {
                        // Skip malformed JSON lines
                        continue;
                    };

                    // Record or update usage if present (e.g. from stream_options or Gemini)
                    if let Some((pt, ct)) = parsed.get("usage").and_then(|u| {
                        Some((
                            u.get("prompt_tokens")?.as_u64()?,
                            u.get("completion_tokens")?.as_u64()?,
                        ))
                    }) {
                        self.last_usage = Some(LlmUsage {
                            prompt_tokens: pt,
                            completion_tokens: ct,
                        });
                    }

                    // Check choices[0]
                    if let Some(choice) = parsed.get("choices").and_then(|c| c.get(0)) {
                        if let Some(reason) = choice.get("finish_reason").and_then(Value::as_str) {
                            if reason == "tool_calls" {
                                self.flush_tool_calls();
                            } else {
                                self.pending_chunks
                                    .push_back(LlmChunk::FinishReason(reason.to_string()));
                            }
                        }

                        if let Some(delta) = choice.get("delta") {
                            // 1. Tool calls delta
                            if let Some(tcs) = delta.get("tool_calls").and_then(Value::as_array) {
                                for tc in tcs {
                                    let idx = tc.get("index").and_then(Value::as_u64).unwrap_or(0)
                                        as usize;

                                    let entry = self
                                        .accumulated_tool_calls
                                        .entry(idx)
                                        .or_insert_with(|| ToolCall::new("", "", ""));

                                    update_tool_call_delta(entry, tc);
                                }
                            }
                            if let Some(delta_extra) = delta.get("extra_content") {
                                for entry in self.accumulated_tool_calls.values_mut() {
                                    if entry.extra_content.is_none() {
                                        entry.extra_content = Some(delta_extra.clone());
                                    }
                                }
                            }

                            // 2. Text Delta
                            if let Some(content) = delta
                                .get("content")
                                .and_then(Value::as_str)
                                .filter(|c| !c.is_empty())
                            {
                                return Some(Ok(LlmChunk::Delta(content.to_string())));
                            }
                        }

                        if let Some(chunk) = self.pending_chunks.pop_front() {
                            return Some(Ok(chunk));
                        }
                    }
                }
                Ok(None) => {
                    self.finish_stream();
                    return self.pending_chunks.pop_front().map(Ok);
                }
                Err(e) => return Some(Err(e.into())),
            }
        }
    }
}

fn update_tool_call_delta(entry: &mut ToolCall, tc: &Value) {
    if let Some(id) = tc.get("id").and_then(Value::as_str) {
        entry.id = id.to_string();
    }

    if let Some(extra) = tc.get("extra_content") {
        entry.extra_content = Some(extra.clone());
    } else if let Some(sig) = tc.get("thought_signature").and_then(Value::as_str) {
        entry.extra_content = Some(serde_json::json!({
            "google": { "thought_signature": sig }
        }));
    }

    if let Some(func) = tc.get("function") {
        if let Some(name) = func.get("name").and_then(Value::as_str) {
            entry.name = name.to_string();
        }
        if let Some(args) = func.get("arguments").and_then(Value::as_str) {
            entry.arguments.push_str(args);
        }
        if entry.extra_content.is_none() {
            if let Some(extra) = func.get("extra_content") {
                entry.extra_content = Some(extra.clone());
            } else if let Some(sig) = func.get("thought_signature").and_then(Value::as_str) {
                entry.extra_content = Some(serde_json::json!({
                    "google": { "thought_signature": sig }
                }));
            }
        }
    }
}

fn build_openai_messages(messages: Vec<LlmMessage>, is_gemini: bool) -> Vec<Value> {
    messages
        .into_iter()
        .map(|m| {
            let mut obj = serde_json::json!({
                "role": m.role,
                "content": m.content,
            });
            if let Some(tool_calls) = m.tool_calls {
                let tc_val: Vec<Value> = tool_calls
                    .into_iter()
                    .map(|tc| build_tool_call_value(tc, is_gemini))
                    .collect();
                obj["tool_calls"] = Value::Array(tc_val);
            }
            if let Some(tcid) = m.tool_call_id {
                obj["tool_call_id"] = Value::String(tcid);
            }
            obj
        })
        .collect()
}

fn build_tool_call_value(tc: ToolCall, is_gemini: bool) -> Value {
    let mut tc_obj = serde_json::json!({
        "id": tc.id,
        "type": "function",
        "function": {
            "name": tc.name,
            "arguments": tc.arguments,
        }
    });

    if let Some(extra) = tc.extra_content {
        tc_obj["extra_content"] = extra;
    } else if is_gemini {
        // Gemini 3.x enforces Thought Signatures on function calls in conversation history.
        // If a real signature was not captured or was loaded from older DB records,
        // use Google's official sentinel value to bypass validation and avoid 400 errors.
        tc_obj["extra_content"] = serde_json::json!({
            "google": {
                "thought_signature": "skip_thought_signature_validator"
            }
        });
    }

    tc_obj
}
