use async_trait::async_trait;

use crate::errors::DomainError;
use crate::events::RunEvent;

/// Sink for emitting run events to the UI.
#[async_trait]
pub trait EventSink: Send + Sync {
    async fn emit(&self, event: RunEvent) -> Result<(), DomainError>;
}
