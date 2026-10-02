use crate::errors::LlmError;

/// Simple, robust Server-Sent Events (SSE) reader over reqwest::Response.
pub struct SseEventReader {
    response: reqwest::Response,
    buffer: Vec<u8>,
    current_event: Option<String>,
}

#[derive(Debug, Clone)]
pub struct SseEvent {
    pub event_type: Option<String>,
    pub data: String,
}

impl SseEventReader {
    pub fn new(response: reqwest::Response) -> Self {
        Self {
            response,
            buffer: Vec::with_capacity(4096),
            current_event: None,
        }
    }

    /// Read next SSE event. Returns `None` at EOF.
    pub async fn next_event(&mut self) -> Result<Option<SseEvent>, LlmError> {
        loop {
            // Check if there is a newline in the buffer
            if let Some(pos) = self.buffer.iter().position(|&b| b == b'\n') {
                let mut line_bytes: Vec<u8> = self.buffer.drain(..=pos).collect();
                // Strip trailing \n and \r
                if line_bytes.ends_with(b"\n") {
                    line_bytes.pop();
                }
                if line_bytes.ends_with(b"\r") {
                    line_bytes.pop();
                }

                let line = String::from_utf8_lossy(&line_bytes).trim().to_string();

                if line.is_empty() {
                    // Empty line resets event
                    self.current_event = None;
                    continue;
                }

                if let Some(event_name) = line.strip_prefix("event:") {
                    self.current_event = Some(event_name.trim().to_string());
                    continue;
                }

                if let Some(data_str) = line.strip_prefix("data:") {
                    let data = data_str.trim().to_string();
                    let event = SseEvent {
                        event_type: self.current_event.clone(),
                        data,
                    };
                    return Ok(Some(event));
                }

                // Other lines like comments (: comment) or unknown are ignored
                continue;
            }

            // No newline found in buffer, fetch next chunk from network
            match self.response.chunk().await? {
                Some(chunk) => {
                    self.buffer.extend_from_slice(&chunk);
                }
                None => {
                    // Stream closed. If remaining buffer has data line:
                    if !self.buffer.is_empty() {
                        let remaining = String::from_utf8_lossy(&self.buffer).trim().to_string();
                        self.buffer.clear();
                        if let Some(data_str) = remaining.strip_prefix("data:") {
                            return Ok(Some(SseEvent {
                                event_type: self.current_event.clone(),
                                data: data_str.trim().to_string(),
                            }));
                        }
                    }
                    return Ok(None);
                }
            }
        }
    }
}
