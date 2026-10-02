# Decision Log — Hubbub

Mọi quyết định quan trọng và thay đổi lớn trong quá trình phát triển **PHẢI** được ghi lại tại đây.
Sắp xếp theo thứ tự thời gian (mới nhất ở trên).

> **QUY TẮC:** PR/commit có thay đổi quan trọng mà KHÔNG cập nhật file này sẽ bị reject.
> Áp dụng cho cả Dev và Agent (AI).

---

## [2026-10-02] Hoàn thành Sprint 1.3: Agent Runtime Core v1 (hubbub-agent & hubbub-testkit)

**Bối cảnh:** Triển khai lõi điều phối Agent (Agent Runtime Loop) trong `hubbub-agent` theo kiến trúc Clean Monolith. Agent crate chỉ phụ thuộc vào `domain` ports, độc lập hoàn toàn với I/O crate. Cần một bộ công cụ kiểm thử test-first (`hubbub-testkit`) mô phỏng LLM và công cụ độc lập, hỗ trợ hủy tác vụ an toàn bằng `CancellationToken`, kiểm soát ngân sách chạy (`BudgetTracker`), và kiểm thử toàn diện các tình huống biên (common edge cases).

**Quyết định:**
1. **Xây dựng Testkit Fixtures (`hubbub-testkit`):**
   - `FakeLlm`: Cài đặt `LlmProvider` cho phép nạp trước các phản hồi kịch bản (text deltas, tool calls, token usage, độ trễ chunk giả lập để test hủy luồng, lỗi mô phỏng).
   - `InMemoryEventSink`: Cài đặt `EventSink` thu thập toàn bộ sự kiện `RunEvent` phát ra cho giao diện UI.
   - `MockToolHost`: Cài đặt `ToolHost` cho phép đăng ký mock tool có độ trễ hoặc trả về lỗi, phục vụ kiểm thử phục hồi và hủy tác vụ.
2. **Quản lý Ngữ cảnh & Lời nhắc (`ContextBuilder`):**
   - Tự động bổ sung thời gian hiện tại (UTC) và chỉ thị ngôn ngữ (ưu tiên tiếng Việt chuẩn xác khi người dùng dùng tiếng Việt).
   - Ánh xạ lịch sử tin nhắn `Message` (với các phần `Text`, `ToolCall`, `ToolResult`) sang định dạng `LlmMessage` chuẩn.
3. **Giám sát Ngân sách Chạy (`BudgetTracker`):**
   - Thực thi kiểm tra giới hạn `max_steps`, `max_tokens`, và `timeout_s` tại mỗi bước trong vòng lặp.
   - Khi vượt ngưỡng, cập nhật trạng thái Run thành `Failed`, phát sự kiện `RunEvent::Error` và dừng vòng lặp an toàn, không bao giờ rơi vào vòng lặp vô tận.
4. **Vòng lặp Điều phối Chính (`AgentRuntime`):**
   - Tích hợp `CancellationToken` tại mọi điểm chờ bất đồng bộ (trước khi gọi LLM, trong khi stream từng chunk LLM, và trong khi thực thi tool).
   - Ghi nhận đầy đủ vòng đời của `Run` và các `Step` (loại `Llm` và `Tool`) vào `Store`.
   - Phục hồi có cấu trúc khi công cụ trả về lỗi (gửi kết quả lỗi về LLM để LLM phản hồi giải thích hoặc sửa sai).
5. **Cải tiến `Store::create_step`:**
   - Bổ sung `ON CONFLICT(id) DO UPDATE` trong SQLite để hỗ trợ cập nhật trạng thái bước thực thi từ `running` sang `completed`/`failed` kèm `duration_ms` và `output_json`.
6. **Kết quả nghiệm thu:** 9/9 test case trong `crates/agent/tests/runtime_tests.rs` vượt qua 100%. Toàn bộ test suite toàn repo: 26/26 tests PASS, `cargo clippy -D warnings` đạt 0 cảnh báo, `cargo fmt` đạt chuẩn.

**Hệ quả:** Hoàn tất Sprint 1.3. Sẵn sàng bước sang **Sprint 1.4: Keyring Vault (`hubbub-vault`)**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Hoàn thành Sprint 1.2: LLM Gateway & SSE Stream (hubbub-llm)

**Bối cảnh:** Triển khai hạ tầng giao tiếp với các mô hình ngôn ngữ lớn (LLM Gateway) cho Phase 1, hỗ trợ cả hai chuẩn API phổ biến nhất hiện nay: OpenAI-compatible (OpenAI, Ollama, OpenRouter, Groq) và Anthropic Claude Messages API. Quy trình tuân thủ nghiêm ngặt **Test-First**, xử lý luồng stream SSE ở cấp byte để chống rách ký tự UTF-8, và đảm bảo khả năng tích lũy tool call streaming.

**Quyết định:**
1. **Byte-level SSE Stream Reader (`SseEventReader`):**
   - Không parse từng chunk byte sang string ngay vì một byte split của mạng có thể cắt ngang một ký tự UTF-8 đa byte tiếng Việt (3 bytes) hoặc Emoji (4 bytes).
   - Tích lũy byte stream vào buffer và chỉ tách dòng theo `\n`, sau đó mới decode UTF-8 và parse event SSE `data:`.
2. **OpenAI-Compatible Adapter (`OpenAiCompatAdapter`):**
   - Hỗ trợ streaming text deltas (`content`).
   - Tích lũy streaming tool calls theo index (`accumulated_tool_calls` qua `BTreeMap`), tự động flush khi nhận `finish_reason: "tool_calls"`.
   - Thu thập usage token (`prompt_tokens`, `completion_tokens`, `total_tokens`) từ chunk cuối cùng.
   - Cơ chế Retry với Exponential Backoff (50ms * 2^(attempt-1)) đối với mã lỗi 5xx và 429; fail-fast ngay lập tức đối với lỗi xác thực (401/403).
3. **Anthropic Adapter (`AnthropicAdapter`):**
   - Chuyển đổi định dạng prompt: trích xuất riêng `system` message và ánh xạ các message còn lại thành `user`/`assistant`.
   - Ánh xạ tool definitions thành định dạng `input_schema` của Anthropic.
   - Hỗ trợ các event: `content_block_start` (tool_use), `content_block_delta` (text_delta, input_json_delta), `message_delta` (usage: output_tokens), `message_start` (usage: input_tokens).
   - Tương tự OpenAI, áp dụng retry với backoff cho lỗi 5xx/429.
4. **Quy trình Test-First với Wiremock:**
   - 7/7 bài kiểm tra tích hợp trong `crates/llm/tests/llm_tests.rs`:
     * Streaming text deltas & `[DONE]` marker.
     * Streaming usage metadata token counts.
     * Streaming tool call arguments accumulation across multiple chunks.
     * Anthropic SSE events (tool_use block, text delta, input/output tokens).
     * Tự động phục hồi khi gặp chunk SSE chứa JSON lỗi/rác mà không làm gián đoạn luồng stream.
     * Retry thành công sau khi gặp 500 Internal Server Error.
     * Dừng ngay lập tức (fail-fast, không retry vô nghĩa) khi nhận mã lỗi 401 Unauthorized.
5. **Kết quả nghiệm thu:** 100% test case vượt qua (7/7 tests, 0.07s), `cargo clippy -D warnings` đạt 0 cảnh báo, `cargo fmt` chuẩn hóa.

**Hệ quả:** Hoàn tất Sprint 1.2. Sẵn sàng bước sang **Sprint 1.3: Agent Runtime Core v1 (`hubbub-agent`)**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Hoàn thành Sprint 1.1: Database SQLite & Migrations (hubbub-store)

**Bối cảnh:** Triển khai tầng lưu trữ dữ liệu bền vững (Persistence Layer) đầu tiên của Phase 1, tuân thủ nghiêm ngặt nguyên tắc **Test-First** và bao quát các **common edge cases** (tiếng Việt, FTS5 unicode, emoji, concurrent access).

**Quyết định:**
1. **Thiết lập Migration SQLite (`0001_initial_schema.sql`):**
   - Bảng `conversations`: Khóa chính UUID v7, theo dõi thời gian `created_at` và `updated_at`, cờ `archived`.
   - Bảng `messages`: Thiết kế append-only, liên kết khóa ngoại CASCADE với `conversations`, lưu trữ các khối nội dung (`parts_json`) hỗ trợ mở rộng.
   - Bảng `runs` & `steps`: Lưu vết toàn diện vòng đời thực thi của Agent, chi phí token và thời gian chạy.
   - Bảng `documents`: Lưu trữ metadata của các tài liệu Workspace dạng Markdown.
   - Bảng ảo `messages_fts` & `documents_fts` (FTS5): Sử dụng bộ tách từ `unicode61` để hỗ trợ tìm kiếm toàn văn tiếng Việt có dấu.
2. **Quy trình Test-First & Edge Cases:**
   - Viết trước 10 test case trong `crates/store/tests/store_tests.rs`:
     * Tiêu đề và nội dung chứa đầy đủ dấu tiếng Việt phức tạp.
     * Emoji Unicode (🚀, 🎉) và khối mã nguồn Markdown.
     * Bản tin báo cáo rất dài (~60 KB văn bản).
     * Các trường hợp phân trang biên (`limit = 0`, `offset` vượt quá tổng số tin).
     * Tìm kiếm toàn văn FTS5 tiếng Việt chính xác với cụm từ có dấu.
     * Cập nhật tài liệu trùng đường dẫn (Upsert conflict resolution).
     * Truy cập đồng thời đa luồng (10 tác vụ async ghi và đọc đồng thời trong chế độ SQLite WAL).
3. **Triển khai `Store` Port:**
   - Cài đặt trait `hubbub_domain::ports::store::Store` trong struct `SqliteStore`.
   - Cấu hình SQLite Pool: Tự động kích hoạt `PRAGMA foreign_keys = ON;`, `journal_mode = WAL;`, `synchronous = NORMAL;`.
   - Cung cấp `SqliteStore::open` cho production và `SqliteStore::open_in_memory` (shared cache) cho kiểm thử độc lập.
4. **Kết quả nghiệm thu:** 10/10 test case vượt qua (0.06s), `cargo clippy -D warnings` đạt 100% không cảnh báo.

**Hệ quả:** Hoàn tất Sprint 1.1. Sẵn sàng bước sang **Sprint 1.2: LLM Gateway & SSE Stream (`hubbub-llm`)**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Nghiệm thu Gate 0: Chốt Stack Tauri 2 + React + Rust Core

**Bối cảnh:** Cần xác nhận kết quả kiểm thử thực tế về mức tiêu thụ RAM và hiệu năng của ứng dụng trên môi trường Windows 10/11 trước khi chuyển sang Phase 1.

**Quyết định:**
1. **Chính thức chốt stack:** Sử dụng **Tauri 2 + React 19 + TypeScript + Rust Core**. Không cần kích hoạt phương án dự phòng Flutter.
2. **Số liệu kiểm thử thực tế:**
   - Tiến trình **Hubbub Rust Core:** Chỉ chiếm **~3.2 MB** RAM.
   - Toàn bộ ứng dụng (bao gồm các tiến trình WebView2 runtime): Chiếm **~180 MB** RAM khi đang chạy trong môi trường phát triển (có Vite HMR và DevTools đi kèm) cùng lúc với tải 1.000 tin nhắn ảo hóa và Milkdown editor.
   - Mức RAM này đạt đúng ngưỡng mục tiêu (≤ 180MB) và dự kiến sẽ giảm thêm 20-40 MB khi xuất bản bản Release chính thức (strip binary + thin LTO + tối ưu CSS/JS).
3. **Cập nhật ADR-0001:** Bổ sung phần kết quả nghiệm thu Gate 0 vào tài liệu kiến trúc.

**Lý do:** Đáp ứng trọn vẹn tiêu chuẩn về RAM, hiệu năng và kiến trúc phân lớp Clean Architecture.

**Hệ quả:** Hoàn tất toàn bộ Phase 0. Đủ điều kiện khởi động **Phase 1: Chat MVP**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Dọn dẹp Tài liệu & Cập nhật Cấu hình Dự án

**Bối cảnh:** Sau khi tổng hợp thành công `MASTER_PLAN.md` và xây dựng nền tảng Phase 0, các file dự thảo kế hoạch cũ (`Plan_01.md`, `Plan_02.md`, `Plan_03.md`) không còn cần thiết và có thể gây nhiễu cho các Agent/Dev mới. Cần làm sạch thư mục `docs/` và bổ sung danh sách context files trong `.antigravity/config.json`.

**Quyết định:**
1. **Xoá bỏ các bản kế hoạch cũ:** Đã loại bỏ `docs/Plan_01.md`, `docs/Plan_02.md`, `docs/Plan_03.md`. Nguồn sự thật duy nhất về kế hoạch hiện tại là `docs/MASTER_PLAN.md`.
2. **Cập nhật `.antigravity/config.json`:** Khai báo toàn bộ các tài liệu cốt lõi (`MASTER_PLAN.md`, `DECISION_LOG.md`, `ARCHITECTURE.md`, `TESTING_GUIDE.md`, `AI_WORKFLOW.md`, `THREAT_MODEL.md`) làm `context_files` mặc định.
3. **Mở rộng command allowlist:** Bổ sung các lệnh `just`, `cargo nextest/deny`, `npx tauri` vào danh sách tự động duyệt an toàn.

**Lý do:** Giữ thư mục tài liệu tinh gọn, chính xác; giúp các Agent AI mới khi truy cập dự án luôn nạp đúng ngữ cảnh chuẩn hóa mà không bị phân tán bởi các bản nháp cũ.

**Hệ quả:** Thư mục `docs/` chỉ chứa tài liệu chính thức đang có hiệu lực.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Hoàn thành Phase 0 Nền móng & Chuẩn bị Spike Gate 0

**Bối cảnh:** Cần dựng nền tảng monorepo (Rust workspace + Tauri 2 React app), hệ thống tài liệu tiêu chuẩn, và ứng dụng Gate 0 Spike để xác thực các tiêu chí kỹ thuật cốt lõi (gõ tiếng Việt, RAM WebView2, tải 1.000 tin nhắn, Milkdown editor).

**Quyết định:**
1. **Khởi tạo Rust Workspace:** Gồm 11 crates (`domain`, `policy`, `agent`, `llm`, `tools`, `mcp`, `store`, `workspace`, `vault`, `app`, `testkit`) và ứng dụng shell `hubbub-desktop` (Tauri 2).
2. **Thiết lập quy chuẩn code:** Khóa toolchain `rust-toolchain.toml`, `rustfmt.toml`, cấu hình `deny.toml` chặn copyleft/vulnerability, lints nghiêm ngặt ở cấp workspace (`forbid(unsafe_code)`, `deny(unwrap_used, expect_used, panic)`).
3. **Hoàn thiện tài liệu:** `ARCHITECTURE.md`, `TESTING_GUIDE.md` (chú trọng common edge cases), `AI_WORKFLOW.md`, `THREAT_MODEL.md`, và 7 bản ADR (`0001` đến `0007`).
4. **Xây dựng Gate 0 Spike App:** Ứng dụng tương tác đầy đủ 5 bài test (Gõ tiếng Việt, Virtualized 1.000 tin nhắn với `@tanstack/react-virtual`, Stream mô phỏng 50t/s, Milkdown WYSIWYG editor trên nền ProseMirror, Scorecard tổng hợp).
5. **Cấu hình CI & Task Runner:** Tạo `justfile` và workflow `.github/workflows/ci.yml`.

**Lý do:** Đảm bảo toàn bộ workspace compile sạch sẽ, cấu trúc phân lớp Clean Architecture được tuân thủ tuyệt đối, sẵn sàng chạy kiểm thử thực tế trên máy người dùng trước khi code tính năng Phase 1.

**Hệ quả:** Có thể khởi chạy `npm run tauri dev` ngay để thực hiện các bài test Gate 0.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Chốt Master Plan v1.0

**Bối cảnh:** Dự án Hubbub cần một kế hoạch phát triển tổng thể thống nhất. Đã có 3 bản kế hoạch riêng biệt (Plan_01, Plan_02, Plan_03) với các hướng tiếp cận khác nhau.

**Quyết định:** Tạo MASTER_PLAN.md tổng hợp, kế thừa:
- Kiến trúc Clean/Hexagonal sâu từ Plan 02
- Tính thực tế, Gate 0, và quy trình AI-assisted từ Plan 03
- Loại bỏ kiến trúc Python sidecar từ Plan 01

**Các quyết định con:**
1. **Stack chính:** Tauri 2 + React + Rust Core (Gate 0 validate, fallback Flutter)
2. **Agent framework:** Tự viết bằng Rust (không dùng LangGraph/LangChain)
3. **Database:** SQLite + FTS5 (không vector DB ở v1)
4. **Voice:** Loại bỏ hoàn toàn khỏi v1 — tránh phức tạp không cần thiết
5. **Testing:** Test-first, ưu tiên common edge cases, danh sách cụ thể trong TESTING_GUIDE
6. **Decision Log:** Bắt buộc cập nhật mỗi khi có quyết định/thay đổi quan trọng
7. **Bug-first:** Luôn fix bug/vấn đề tiềm ẩn trước khi phát triển tính năng mới

**Lý do:** Cần kế hoạch khả thi cho 1 developer với AI hỗ trợ, kiến trúc tốt ngay từ đầu, dễ mở rộng, có tài liệu đầy đủ cho Dev/Agent mới tiếp cận.

**Hệ quả:** Bắt đầu Phase 0 (Foundation + Gate 0). Mọi thay đổi kiến trúc/stack phải viết ADR.

**Trạng thái:** Đã áp dụng
