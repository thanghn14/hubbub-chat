use chrono::{DateTime, Utc};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use crate::errors::StoreError;
use hubbub_domain::entities::conversation::Conversation;

pub async fn create(pool: &SqlitePool, conv: &Conversation) -> Result<(), StoreError> {
    let id_str = conv.id.to_string();
    let created_at_str = conv.created_at.to_rfc3339();
    let updated_at_str = conv.updated_at.to_rfc3339();
    let archived_int = if conv.archived { 1 } else { 0 };

    sqlx::query(
        r#"
        INSERT INTO conversations (id, title, agent_id, created_at, updated_at, archived)
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(id_str)
    .bind(&conv.title)
    .bind(&conv.agent_id)
    .bind(created_at_str)
    .bind(updated_at_str)
    .bind(archived_int)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get(pool: &SqlitePool, id: Uuid) -> Result<Option<Conversation>, StoreError> {
    let id_str = id.to_string();
    let row = sqlx::query(
        r#"
        SELECT id, title, agent_id, created_at, updated_at, archived
        FROM conversations
        WHERE id = ?
        "#,
    )
    .bind(id_str)
    .fetch_optional(pool)
    .await?;

    match row {
        Some(row) => {
            let id: String = row.try_get("id")?;
            let title: String = row.try_get("title")?;
            let agent_id: String = row.try_get("agent_id")?;
            let created_at_str: String = row.try_get("created_at")?;
            let updated_at_str: String = row.try_get("updated_at")?;
            let archived_int: i64 = row.try_get("archived")?;

            let parsed_id = Uuid::parse_str(&id)
                .map_err(|e| StoreError::InvalidData(format!("Invalid UUID: {e}")))?;
            let created_at = DateTime::parse_from_rfc3339(&created_at_str)
                .map_err(|e| StoreError::InvalidData(format!("Invalid created_at: {e}")))?
                .with_timezone(&Utc);
            let updated_at = DateTime::parse_from_rfc3339(&updated_at_str)
                .map_err(|e| StoreError::InvalidData(format!("Invalid updated_at: {e}")))?
                .with_timezone(&Utc);

            Ok(Some(Conversation {
                id: parsed_id,
                title,
                agent_id,
                created_at,
                updated_at,
                archived: archived_int != 0,
            }))
        }
        None => Ok(None),
    }
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<Conversation>, StoreError> {
    let rows = sqlx::query(
        r#"
        SELECT id, title, agent_id, created_at, updated_at, archived
        FROM conversations
        ORDER BY updated_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    let mut result = Vec::with_capacity(rows.len());
    for row in rows {
        let id: String = row.try_get("id")?;
        let title: String = row.try_get("title")?;
        let agent_id: String = row.try_get("agent_id")?;
        let created_at_str: String = row.try_get("created_at")?;
        let updated_at_str: String = row.try_get("updated_at")?;
        let archived_int: i64 = row.try_get("archived")?;

        let parsed_id = Uuid::parse_str(&id)
            .map_err(|e| StoreError::InvalidData(format!("Invalid UUID: {e}")))?;
        let created_at = DateTime::parse_from_rfc3339(&created_at_str)
            .map_err(|e| StoreError::InvalidData(format!("Invalid created_at: {e}")))?
            .with_timezone(&Utc);
        let updated_at = DateTime::parse_from_rfc3339(&updated_at_str)
            .map_err(|e| StoreError::InvalidData(format!("Invalid updated_at: {e}")))?
            .with_timezone(&Utc);

        result.push(Conversation {
            id: parsed_id,
            title,
            agent_id,
            created_at,
            updated_at,
            archived: archived_int != 0,
        });
    }

    Ok(result)
}

pub async fn update(pool: &SqlitePool, conv: &Conversation) -> Result<(), StoreError> {
    let id_str = conv.id.to_string();
    let updated_at_str = conv.updated_at.to_rfc3339();
    let archived_int = if conv.archived { 1 } else { 0 };

    sqlx::query(
        r#"
        UPDATE conversations
        SET title = ?, agent_id = ?, updated_at = ?, archived = ?
        WHERE id = ?
        "#,
    )
    .bind(&conv.title)
    .bind(&conv.agent_id)
    .bind(updated_at_str)
    .bind(archived_int)
    .bind(id_str)
    .execute(pool)
    .await?;

    Ok(())
}
