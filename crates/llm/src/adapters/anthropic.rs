use async_trait::async_trait;
use serde_json::Value;
use std::collections::VecDeque;

use crate::config::ProviderConfig;
use crate::errors::{extract_retry_delay, format_api_error, LlmError};
use crate::sse::SseEventReader;
use hubbub_domain::errors::DomainError;
use hubbub_domain::ports::llm::{
    LlmChunk, LlmConfig, LlmMessage, LlmProvider, LlmStream, LlmUsage, ToolCall, ToolSchema,
};

pub struct AnthropicAdapter {
    config: ProviderConfig,
    client: reqwest::Client,
}

impl AnthropicAdapter {
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
            .unwrap_or("https://api.anthropic.com");

        let trimmed = base.trim_end_matches('/');
        if trimmed.ends_with("/v1/messages") || trimmed.ends_with("/messages") {
            trimmed.to_string()
        } else {
            format!("{trimmed}/v1/messages")
        }
    }
}

#[async_trait]
impl LlmProvider for AnthropicAdapter {
    async fn chat_stream(
        &self,
        messages: Vec<LlmMessage>,
        tools: Vec<ToolSchema>,
        config: LlmConfig,
    ) -> Result<Box<dyn LlmStream>, DomainError> {
        let endpoint = self.build_endpoint();

        let mut system_prompt = String::new();
        let mut anthropic_messages = Vec::new();

        for m in messages {
            if m.role == "system" {
                if !system_prompt.is_empty() {
                    system_prompt.push('\n');
                }
                system_prompt.push_str(&m.content);
            } else {
                anthropic_messages.push(serde_json::json!({
                    "role": m.role,
                    "content": m.content,
                }));
            }
        }

        let max_tokens = config.max_tokens.unwrap_or(4096);
        let mut payload = serde_json::json!({
            "model": config.model,
            "max_tokens": max_tokens,
            "messages": anthropic_messages,
            "stream": true,
        });

        if !system_prompt.is_empty() {
            payload["system"] = serde_json::json!(system_prompt);
        }
        if let Some(temp) = config.temperature {
            payload["temperature"] = serde_json::json!(temp);
        }

        if !tools.is_empty() {
            let tools_val: Vec<Value> = tools
                .into_iter()
                .map(|t| {
                    serde_json::json!({
                        "name": t.name,
                        "description": t.description,
                        "input_schema": t.parameters,
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
                .header("x-api-key", &self.config.api_key)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .json(&payload);

            let res = req.send().await;

            match res {
                Ok(resp) => {
                    let status = resp.status();
                    if status.is_success() {
                        return Ok(Box::new(AnthropicStream::new(resp)));
                    }

                    let headers = resp.headers().clone();
                    let err_text = resp.text().await.unwrap_or_default();

                    if status == reqwest::StatusCode::TOO_MANY_REQUESTS && attempt <= max_retries {
                        let delay = extract_retry_delay(&headers, &err_text)
                            .unwrap_or_else(|| std::time::Duration::from_millis(1000 * (1 << (attempt - 1))));
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
                    tokio::time::sleep(std::time::Duration::from_millis(200 * (1 << (attempt - 1))))
                        .await;
                    continue;
                }
                Err(e) => return Err(LlmError::Http(e).into()),
            }
        }
    }
}

pub struct AnthropicStream {
    reader: SseEventReader,
    input_tokens: u64,
    current_tool_call: Option<ToolCall>,
    pending_chunks: VecDeque<LlmChunk>,
    finished: bool,
}

impl AnthropicStream {
    pub fn new(response: reqwest::Response) -> Self {
        Self {
            reader: SseEventReader::new(response),
            input_tokens: 0,
            current_tool_call: None,
            pending_chunks: VecDeque::new(),
            finished: false,
        }
    }
}

#[async_trait]
impl LlmStream for AnthropicStream {
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
                    let Ok(parsed): Result<Value, _> = serde_json::from_str(&event.data) else {
                        continue;
                    };

                    let event_type = event
                        .event_type
                        .as_deref()
                        .or_else(|| parsed.get("type").and_then(Value::as_str))
                        .unwrap_or("");

                    match event_type {
                        "message_start" => {
                            if let Some(in_tok) = parsed
                                .get("message")
                                .and_then(|m| m.get("usage"))
                                .and_then(|u| u.get("input_tokens"))
                                .and_then(Value::as_u64)
                            {
                                self.input_tokens = in_tok;
                            }
                        }
                        "content_block_start" => {
                            if let Some(block) = parsed.get("content_block").filter(|b| {
                                b.get("type").and_then(Value::as_str) == Some("tool_use")
                            }) {
                                let id = block
                                    .get("id")
                                    .and_then(Value::as_str)
                                    .unwrap_or("")
                                    .to_string();
                                let name = block
                                    .get("name")
                                    .and_then(Value::as_str)
                                    .unwrap_or("")
                                    .to_string();
                                self.current_tool_call = Some(ToolCall::new(
                                    id,
                                    name,
                                    String::new(),
                                ));
                            }
                        }
                        "content_block_delta" => {
                            if let Some(delta) = parsed.get("delta") {
                                match delta.get("type").and_then(Value::as_str) {
                                    Some("text_delta") => {
                                        if let Some(text) = delta
                                            .get("text")
                                            .and_then(Value::as_str)
                                            .filter(|t| !t.is_empty())
                                        {
                                            return Some(Ok(LlmChunk::Delta(text.to_string())));
                                        }
                                    }
                                    Some("input_json_delta") => {
                                        if let (Some(partial), Some(tc)) = (
                                            delta.get("partial_json").and_then(Value::as_str),
                                            &mut self.current_tool_call,
                                        ) {
                                            tc.arguments.push_str(partial);
                                        }
                                    }
                                    _ => {}
                                }
                            }
                        }
                        "content_block_stop" => {
                            if let Some(tc) = self.current_tool_call.take() {
                                return Some(Ok(LlmChunk::ToolCall(tc)));
                            }
                        }
                        "message_delta" => {
                            if let Some(out_tok) = parsed
                                .get("usage")
                                .and_then(|u| u.get("output_tokens"))
                                .and_then(Value::as_u64)
                            {
                                return Some(Ok(LlmChunk::Usage(LlmUsage {
                                    prompt_tokens: self.input_tokens,
                                    completion_tokens: out_tok,
                                })));
                            }
                        }
                        "message_stop" => {
                            if let Some(tc) = self.current_tool_call.take() {
                                self.pending_chunks.push_back(LlmChunk::ToolCall(tc));
                            }
                            self.pending_chunks.push_back(LlmChunk::Done);
                            self.finished = true;
                            return self.pending_chunks.pop_front().map(Ok);
                        }
                        _ => {}
                    }
                }
                Ok(None) => {
                    if let Some(tc) = self.current_tool_call.take() {
                        self.pending_chunks.push_back(LlmChunk::ToolCall(tc));
                    }
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
