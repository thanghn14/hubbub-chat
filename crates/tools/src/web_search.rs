//! Web search tool implementation using DuckDuckGo Lite (no API key required).

use scraper::{Html, Selector};
use std::time::Duration;

use crate::errors::ToolError;

pub struct WebSearchTool {
    client: reqwest::Client,
}

#[derive(Debug, Clone)]
pub struct SearchItem {
    pub title: String,
    pub url: String,
    pub snippet: String,
}

impl Default for WebSearchTool {
    fn default() -> Self {
        Self::new()
    }
}

impl WebSearchTool {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(12))
            .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Hubbub/0.2.0")
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self { client }
    }

    /// Execute web search and format results as Markdown.
    pub async fn search(&self, query: &str) -> Result<String, ToolError> {
        let trimmed_query = query.trim();
        if trimmed_query.is_empty() {
            return Err(ToolError::MissingParameter("query"));
        }

        let results = self.fetch_duckduckgo_lite(trimmed_query).await?;
        if results.is_empty() {
            return Ok(format!(
                "Không tìm thấy kết quả tìm kiếm trực tiếp cho: \"{trimmed_query}\". Bạn có thể diễn đạt lại câu hỏi hoặc thử từ khóa khác."
            ));
        }

        let mut output = format!("### Kết quả tìm kiếm Web cho: \"{trimmed_query}\"\n\n");
        for (idx, item) in results.iter().take(8).enumerate() {
            let num = idx + 1;
            let title = if item.title.is_empty() { "Không có tiêu đề" } else { &item.title };
            output.push_str(&format!("{num}. **[{title}]({url})**\n", url = item.url));
            if !item.snippet.is_empty() {
                output.push_str(&format!("   {}\n", item.snippet.trim()));
            }
            output.push('\n');
        }

        Ok(output.trim_end().to_string())
    }

    async fn fetch_duckduckgo_lite(&self, query: &str) -> Result<Vec<SearchItem>, ToolError> {
        let form_params = [("q", query), ("kl", "wt-wt")];

        let res = self
            .client
            .post("https://lite.duckduckgo.com/lite/")
            .form(&form_params)
            .send()
            .await
            .map_err(|e| ToolError::Network(format!("Lỗi kết nối tới công cụ tìm kiếm: {e}")))?;

        if !res.status().is_success() {
            return Err(ToolError::Network(format!(
                "Search engine returned status: {}",
                res.status()
            )));
        }

        let html_text = res
            .text()
            .await
            .map_err(|e| ToolError::Network(format!("Lỗi đọc nội dung phản hồi: {e}")))?;

        Ok(Self::parse_lite_html(&html_text))
    }

    pub fn parse_lite_html(html: &str) -> Vec<SearchItem> {
        let document = Html::parse_document(html);
        let link_sel = Selector::parse("a.result-link").ok();
        let snippet_sel = Selector::parse("td.result-snippet").ok();

        let mut links = Vec::new();
        if let Some(sel) = link_sel {
            for el in document.select(&sel) {
                let raw_href = el.value().attr("href").unwrap_or_default().trim();
                let clean_url = Self::extract_target_url(raw_href);
                let title = el.text().collect::<Vec<_>>().join(" ").trim().to_string();
                if !clean_url.is_empty() && !title.is_empty() {
                    links.push((title, clean_url));
                }
            }
        }

        let mut snippets = Vec::new();
        if let Some(sel) = snippet_sel {
            for el in document.select(&sel) {
                let snippet = el.text().collect::<Vec<_>>().join(" ").trim().to_string();
                if !snippet.is_empty() {
                    snippets.push(snippet);
                }
            }
        }

        let mut results = Vec::new();
        for (i, (title, url)) in links.into_iter().enumerate() {
            let snippet = snippets.get(i).cloned().unwrap_or_default();
            results.push(SearchItem { title, url, snippet });
        }

        results
    }

    /// Extract actual target URL from DuckDuckGo redirect format if needed.
    fn extract_target_url(raw_href: &str) -> String {
        if raw_href.starts_with("http://") || raw_href.starts_with("https://") {
            return raw_href.to_string();
        }

        if let Some(uddg_idx) = raw_href.find("uddg=") {
            let query_part = &raw_href[uddg_idx + 5..];
            let end_idx = query_part.find('&').unwrap_or(query_part.len());
            let encoded_url = &query_part[..end_idx];
            let mut decoded = String::new();
            for (k, _) in url::form_urlencoded::parse(encoded_url.as_bytes()) {
                decoded.push_str(&k);
            }
            if !decoded.is_empty() {
                return decoded;
            }
        }

        if raw_href.starts_with("//") {
            return format!("https:{raw_href}");
        }

        raw_href.to_string()
    }
}
