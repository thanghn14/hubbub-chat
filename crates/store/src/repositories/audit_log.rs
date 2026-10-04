use chrono::{DateTime, Utc};
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use crate::errors::StoreError;
use hubbub_domain::entities::audit_log::AuditLog;

pub async fn record(pool: &SqlitePool, log: &AuditLog) -> Result<(), StoreError> {
    let id_str = log.id.to_string();
    let ts_str = log.timestamp.to_rfc3339();
    let run_id_str = log.run_id.map(|r| r.to_string());

    sqlx::query(
        r#"
        INSERT INTO audit_logs (id, timestamp, run_id, tool_name, args_digest, decision, result_digest)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id_str)
    .bind(&ts_str)
    .bind(run_id_str)
    .bind(&log.tool_name)
    .bind(&log.args_digest)
    .bind(&log.decision)
    .bind(&log.result_digest)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn list(pool: &SqlitePool, limit: u32) -> Result<Vec<AuditLog>, StoreError> {
    let rows = sqlx::query(
        r#"
        SELECT id, timestamp, run_id, tool_name, args_digest, decision, result_digest
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT ?
        "#,
    )
    .bind(limit as i64)
    .fetch_all(pool)
    .await?;

    let mut result = Vec::with_capacity(rows.len());
    for row in rows {
        let id_str: String = row.try_get("id")?;
        let ts_str: String = row.try_get("timestamp")?;
        let run_id_str: Option<String> = row.try_get("run_id")?;
        let tool_name: String = row.try_get("tool_name")?;
        let args_digest: String = row.try_get("args_digest")?;
        let decision: String = row.try_get("decision")?;
        let result_digest: Option<String> = row.try_get("result_digest")?;

        let id = Uuid::parse_str(&id_str)
            .map_err(|e| StoreError::InvalidData(format!("Invalid UUID in audit log: {e}")))?;
        let timestamp = DateTime::parse_from_rfc3339(&ts_str)
            .map_err(|e| StoreError::InvalidData(format!("Invalid timestamp in audit log: {e}")))?
            .with_timezone(&Utc);
        let run_id = run_id_str
            .as_deref()
            .map(Uuid::parse_str)
            .transpose()
            .map_err(|e| StoreError::InvalidData(format!("Invalid run UUID in audit log: {e}")))?;

        result.push(AuditLog {
            id,
            timestamp,
            run_id,
            tool_name,
            args_digest,
            decision,
            result_digest,
        });
    }

    Ok(result)
}
