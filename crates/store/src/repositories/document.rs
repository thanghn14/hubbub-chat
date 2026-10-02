use chrono::{DateTime, Utc};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use hubbub_domain::entities::document::Document;
use crate::errors::StoreError;

pub async fn upsert(pool: &SqlitePool, doc: &Document) -> Result<(), StoreError> {
    let id_str = doc.id.to_string();
    let tags_json = serde_json::to_string(&doc.tags)?;
    let run_id_str = doc.run_id.map(|r| r.to_string());
    let created_at_str = doc.created_at.to_rfc3339();
    let updated_at_str = doc.updated_at.to_rfc3339();

    // 1. Upsert into documents table (conflict on path)
    sqlx::query(
        r#"
        INSERT INTO documents (id, path, title, tags_json, agent_id, run_id, content_hash, size_bytes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(path) DO UPDATE SET
            title = excluded.title,
            tags_json = excluded.tags_json,
            agent_id = excluded.agent_id,
            run_id = excluded.run_id,
            content_hash = excluded.content_hash,
            size_bytes = excluded.size_bytes,
            updated_at = excluded.updated_at
        "#,
    )
    .bind(&id_str)
    .bind(&doc.path)
    .bind(&doc.title)
    .bind(&tags_json)
    .bind(&doc.agent_id)
    .bind(run_id_str)
    .bind(&doc.content_hash)
    .bind(doc.size_bytes as i64)
    .bind(created_at_str)
    .bind(updated_at_str)
    .execute(pool)
    .await?;

    // 2. Update documents_fts index
    // Delete existing entry by path if any, then insert new
    sqlx::query(
        r#"
        DELETE FROM documents_fts WHERE path = ?
        "#,
    )
    .bind(&doc.path)
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO documents_fts (document_id, path, title)
        VALUES (?, ?, ?)
        "#,
    )
    .bind(&id_str)
    .bind(&doc.path)
    .bind(&doc.title)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<Document>, StoreError> {
    let rows = sqlx::query(
        r#"
        SELECT id, path, title, tags_json, agent_id, run_id, content_hash, size_bytes, created_at, updated_at
        FROM documents
        ORDER BY updated_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    let mut result = Vec::with_capacity(rows.len());
    for row in rows {
        result.push(parse_document_row(&row)?);
    }

    Ok(result)
}

pub async fn search(pool: &SqlitePool, query: &str) -> Result<Vec<Document>, StoreError> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }

    let fts_query = format_fts_query(trimmed);

    let rows = sqlx::query(
        r#"
        SELECT d.id, d.path, d.title, d.tags_json, d.agent_id, d.run_id, d.content_hash, d.size_bytes, d.created_at, d.updated_at
        FROM documents d
        JOIN documents_fts fts ON d.id = fts.document_id
        WHERE documents_fts MATCH ?
        ORDER BY fts.rank
        LIMIT 50
        "#,
    )
    .bind(fts_query)
    .fetch_all(pool)
    .await?;

    let mut result = Vec::with_capacity(rows.len());
    for row in rows {
        result.push(parse_document_row(&row)?);
    }

    Ok(result)
}

fn parse_document_row(row: &sqlx::sqlite::SqliteRow) -> Result<Document, StoreError> {
    let id_str: String = row.try_get("id")?;
    let path: String = row.try_get("path")?;
    let title: String = row.try_get("title")?;
    let tags_json: String = row.try_get("tags_json")?;
    let agent_id: Option<String> = row.try_get("agent_id")?;
    let run_id_str: Option<String> = row.try_get("run_id")?;
    let content_hash: String = row.try_get("content_hash")?;
    let size_bytes: i64 = row.try_get("size_bytes")?;
    let created_at_str: String = row.try_get("created_at")?;
    let updated_at_str: String = row.try_get("updated_at")?;

    let id = Uuid::parse_str(&id_str)
        .map_err(|e| StoreError::InvalidData(format!("Invalid UUID: {e}")))?;
    let run_id = match run_id_str {
        Some(s) => Some(
            Uuid::parse_str(&s)
                .map_err(|e| StoreError::InvalidData(format!("Invalid run_id UUID: {e}")))?,
        ),
        None => None,
    };
    let tags: Vec<String> = serde_json::from_str(&tags_json)?;
    let created_at = DateTime::parse_from_rfc3339(&created_at_str)
        .map_err(|e| StoreError::InvalidData(format!("Invalid created_at: {e}")))?
        .with_timezone(&Utc);
    let updated_at = DateTime::parse_from_rfc3339(&updated_at_str)
        .map_err(|e| StoreError::InvalidData(format!("Invalid updated_at: {e}")))?
        .with_timezone(&Utc);

    Ok(Document {
        id,
        path,
        title,
        tags,
        agent_id,
        run_id,
        content_hash,
        size_bytes: size_bytes as u64,
        created_at,
        updated_at,
    })
}

fn format_fts_query(query: &str) -> String {
    let words: Vec<String> = query
        .split_whitespace()
        .map(|w| {
            let sanitized = w.replace('"', "\"\"");
            format!("\"{sanitized}\"")
        })
        .collect();

    if words.is_empty() {
        "\"\"".to_string()
    } else {
        words.join(" AND ")
    }
}
