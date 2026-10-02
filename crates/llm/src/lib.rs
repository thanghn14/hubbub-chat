//! # hubbub-llm
//!
//! LLM provider gateway and streaming client for Hubbub.
//! Provides adapters for OpenAI-compatible endpoints (Ollama, OpenAI, Groq, OpenRouter)
//! and the Anthropic Claude Messages API.

pub mod adapters;
pub mod config;
pub mod errors;
pub mod sse;

pub use adapters::anthropic::AnthropicAdapter;
pub use adapters::openai_compat::OpenAiCompatAdapter;
pub use config::ProviderConfig;
pub use errors::LlmError;
