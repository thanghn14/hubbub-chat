use async_trait::async_trait;
use crate::errors::DomainError;
use crate::entities::conversation::{Conversation, Message};
use crate::entities::run::{Run, Step};
use crate::entities::document::Document;
use uuid::Uuid;

/// Port for persistent storage operations.
#[async_trait]
pub trait Store: Send + Sync {
    // Conversations
    async fn create_conversation(&self, conv: &Conversation) -> Result<(), DomainError>;
    async fn get_conversation(&self, id: Uuid) -> Result<Option<Conversation>, DomainError>;
    async fn list_conversations(&self) -> Result<Vec<Conversation>, DomainError>;
    async fn update_conversation(&self, conv: &Conversation) -> Result<(), DomainError>;

    // Messages
    async fn append_message(&self, msg: &Message) -> Result<(), DomainError>;
    async fn list_messages(&self, conversation_id: Uuid, limit: u32, offset: u32)
        -> Result<Vec<Message>, DomainError>;

    // Runs
    async fn create_run(&self, run: &Run) -> Result<(), DomainError>;
    async fn update_run(&self, run: &Run) -> Result<(), DomainError>;
    async fn get_run(&self, id: Uuid) -> Result<Option<Run>, DomainError>;

    // Steps
    async fn create_step(&self, step: &Step) -> Result<(), DomainError>;
    async fn list_steps(&self, run_id: Uuid) -> Result<Vec<Step>, DomainError>;

    // Documents
    async fn upsert_document(&self, doc: &Document) -> Result<(), DomainError>;
    async fn list_documents(&self) -> Result<Vec<Document>, DomainError>;
    async fn search_documents(&self, query: &str) -> Result<Vec<Document>, DomainError>;
    async fn search_messages(&self, query: &str) -> Result<Vec<Message>, DomainError>;
}
