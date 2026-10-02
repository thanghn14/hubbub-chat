//! # hubbub-agent
//!
//! Agent runtime, context builder, budget tracker.
//! Depends on domain ports only.

pub mod budget;
pub mod context;
pub mod errors;
pub mod runtime;

pub use budget::BudgetTracker;
pub use context::ContextBuilder;
pub use errors::AgentError;
pub use runtime::AgentRuntime;
