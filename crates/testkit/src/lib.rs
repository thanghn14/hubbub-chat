//! # hubbub-testkit
//!
//! Shared test utilities: FakeLlm, InMemoryEventSink, MockToolHost, fixtures.

pub mod event_sink;
pub mod fake_llm;
pub mod fixtures;
pub mod mock_tools;

pub use event_sink::InMemoryEventSink;
pub use fake_llm::{FakeLlm, FakeResponse, RecordedCall};
pub use fixtures::create_test_agent;
pub use mock_tools::{MockToolHost, RecordedToolCall};
