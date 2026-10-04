use chrono::{DateTime, Utc};
use sqlx::{Row, SqlitePool};
use std::collections::HashSet;

use crate::errors::StoreError;
use hubbub_domain::entities::model_quota::{get_default_quota_for_model, ModelUsageStat};

pub async fn get_model_usage_stats(pool: &SqlitePool) -> Result<Vec<ModelUsageStat>, StoreError> {
    let rows = sqlx::query(
        r#"
        SELECT
            json_extract(s.input_json, '$.model') AS model_name,
            COALESCE(SUM(CAST(json_extract(r.usage_json, '$.prompt_tokens') AS INTEGER)), 0) AS total_prompt,
            COALESCE(SUM(CAST(json_extract(r.usage_json, '$.completion_tokens') AS INTEGER)), 0) AS total_completion,
            COALESCE(SUM(CAST(json_extract(r.usage_json, '$.total_tokens') AS INTEGER)), 0) AS total_tokens,
            COUNT(DISTINCT r.id) AS total_runs,
            COALESCE(SUM(r.cost_usd), 0.0) AS total_cost,
            MAX(r.started_at) AS last_used,
            COALESCE(SUM(CASE WHEN r.started_at >= date('now', 'start of day') THEN 1 ELSE 0 END), 0) AS reqs_today,
            COALESCE(SUM(CASE WHEN r.started_at >= date('now', 'start of day') THEN CAST(json_extract(r.usage_json, '$.total_tokens') AS INTEGER) ELSE 0 END), 0) AS tokens_today
        FROM steps s
        JOIN runs r ON s.run_id = r.id
        WHERE s.kind = 'llm' AND json_extract(s.input_json, '$.model') IS NOT NULL
        GROUP BY model_name
        ORDER BY last_used DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    let mut result = Vec::new();
    let mut seen_models = HashSet::new();

    for row in rows {
        let model: Option<String> = row.try_get("model_name")?;
        let Some(model) = model else { continue };
        if model.is_empty() { continue; }

        let total_prompt: i64 = row.try_get("total_prompt").unwrap_or(0);
        let total_completion: i64 = row.try_get("total_completion").unwrap_or(0);
        let total_tokens: i64 = row.try_get("total_tokens").unwrap_or(0);
        let total_runs: i64 = row.try_get("total_runs").unwrap_or(0);
        let total_cost: f64 = row.try_get("total_cost").unwrap_or(0.0);
        let last_used_str: Option<String> = row.try_get("last_used").ok();
        let reqs_today: i64 = row.try_get("reqs_today").unwrap_or(0);
        let tokens_today: i64 = row.try_get("tokens_today").unwrap_or(0);

        let last_used_at = last_used_str
            .as_deref()
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc));

        let (provider, rpm_limit, rpd_limit, is_free_tier) = get_default_quota_for_model(&model);

        seen_models.insert(model.clone());
        result.push(ModelUsageStat {
            model,
            provider,
            total_prompt_tokens: total_prompt.max(0) as u64,
            total_completion_tokens: total_completion.max(0) as u64,
            total_tokens: total_tokens.max(0) as u64,
            total_runs: total_runs.max(0) as u64,
            total_cost_usd: total_cost,
            requests_today: reqs_today.max(0) as u64,
            tokens_today: tokens_today.max(0) as u64,
            rpm_limit,
            rpd_limit,
            is_free_tier,
            last_used_at,
        });
    }

    // Ensure popular standard models appear in list for quota awareness even before first run
    let default_seed_models = [
        "gemini-3.8-flash",
        "gemini-1.5-pro",
        "claude-sonnet-4-20250514",
        "gpt-4o-mini",
        "llama-3.3-70b-versatile",
    ];

    for default_model in default_seed_models {
        if !seen_models.contains(default_model) {
            let (provider, rpm_limit, rpd_limit, is_free_tier) = get_default_quota_for_model(default_model);
            result.push(ModelUsageStat {
                model: default_model.to_string(),
                provider,
                total_prompt_tokens: 0,
                total_completion_tokens: 0,
                total_tokens: 0,
                total_runs: 0,
                total_cost_usd: 0.0,
                requests_today: 0,
                tokens_today: 0,
                rpm_limit,
                rpd_limit,
                is_free_tier,
                last_used_at: None,
            });
        }
    }

    Ok(result)
}
