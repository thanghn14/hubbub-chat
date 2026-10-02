use sqlx::SqlitePool;
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous};
use std::str::FromStr;
use uuid::Uuid;

use crate::errors::StoreError;

pub async fn create_pool(database_path_or_url: &str) -> Result<SqlitePool, StoreError> {
    let options = SqliteConnectOptions::from_str(database_path_or_url)?
        .create_if_missing(true)
        .foreign_keys(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    run_migrations(&pool).await?;

    Ok(pool)
}

pub async fn create_in_memory_pool() -> Result<SqlitePool, StoreError> {
    let unique_name = format!("mem_{}", Uuid::now_v7().simple());
    let url = format!("sqlite:file:{}?mode=memory&cache=shared", unique_name);

    let options = SqliteConnectOptions::from_str(&url)?
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    run_migrations(&pool).await?;

    Ok(pool)
}

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), StoreError> {
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}
