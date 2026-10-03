use chrono::Utc;
use hubbub_domain::entities::agent::Agent;
use hubbub_domain::entities::conversation::{Message, MessagePart, MessageRole};
use hubbub_domain::ports::llm::{LlmMessage, ToolCall};

pub struct ContextBuilder;

impl ContextBuilder {
    pub fn build(
        agent: &Agent,
        history: &[Message],
        current_prompt: Option<&str>,
    ) -> Vec<LlmMessage> {
        let mut messages = Vec::new();

        // 1. System Prompt with Current Time and Language Preference
        let now_utc = Utc::now().to_rfc3339();
        let system_content = format!(
            "{}\n\n[Current Time (UTC): {}]\n[Instruction: Provide comprehensive, well-structured, in-depth answers. Do not rush or artificially truncate your explanations. When explaining concepts or code, provide complete runnable examples with thorough step-by-step reasoning. Reply in Vietnamese when the user asks in Vietnamese.]",
            agent.system_prompt.trim(),
            now_utc
        );

        messages.push(LlmMessage {
            role: "system".to_string(),
            content: system_content,
            tool_calls: None,
            tool_call_id: None,
        });

        // 2. Conversation History
        for msg in history {
            match msg.role {
                MessageRole::User => {
                    let mut text = String::new();
                    for part in &msg.parts {
                        if let MessagePart::Text(t) = part {
                            text.push_str(t);
                        }
                    }
                    if !text.is_empty() {
                        // Merge consecutive user messages to avoid confusing LLMs
                        if let Some(last) = messages.last_mut().filter(|m| m.role == "user") {
                            if last.content != text {
                                last.content.push_str("\n\n");
                                last.content.push_str(&text);
                            }
                            continue;
                        }
                        messages.push(LlmMessage {
                            role: "user".to_string(),
                            content: text,
                            tool_calls: None,
                            tool_call_id: None,
                        });
                    }
                }
                MessageRole::Assistant => {
                    let mut text = String::new();
                    let mut tool_calls = Vec::new();

                    for part in &msg.parts {
                        match part {
                            MessagePart::Text(t) => text.push_str(t),
                            MessagePart::ToolCall {
                                id,
                                name,
                                arguments,
                                extra_content,
                            } => {
                                tool_calls.push(ToolCall {
                                    id: id.clone(),
                                    name: name.clone(),
                                    arguments: arguments.to_string(),
                                    extra_content: extra_content.clone(),
                                });
                            }
                            _ => {}
                        }
                    }

                    // Skip empty assistant messages (e.g. from failed or aborted runs)
                    if text.is_empty() && tool_calls.is_empty() {
                        continue;
                    }

                    messages.push(LlmMessage {
                        role: "assistant".to_string(),
                        content: text,
                        tool_calls: if tool_calls.is_empty() {
                            None
                        } else {
                            Some(tool_calls)
                        },
                        tool_call_id: None,
                    });
                }
                MessageRole::Tool => {
                    for part in &msg.parts {
                        if let MessagePart::ToolResult {
                            tool_call_id,
                            result,
                        } = part
                        {
                            let content_str = match result {
                                serde_json::Value::String(s) => s.clone(),
                                other => other.to_string(),
                            };
                            messages.push(LlmMessage {
                                role: "tool".to_string(),
                                content: content_str,
                                tool_calls: None,
                                tool_call_id: Some(tool_call_id.clone()),
                            });
                        }
                    }
                }
                MessageRole::System => {}
            }
        }

        // 3. New User Prompt (if provided)
        if let Some(prompt) = current_prompt.filter(|p| !p.is_empty()) {
            if let Some(last) = messages.last_mut().filter(|m| m.role == "user") {
                if last.content != prompt {
                    last.content.push_str("\n\n");
                    last.content.push_str(prompt);
                }
                return messages;
            }
            messages.push(LlmMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
                tool_calls: None,
                tool_call_id: None,
            });
        }

        messages
    }
}
