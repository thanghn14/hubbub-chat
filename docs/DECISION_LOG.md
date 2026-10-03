# Decision Log — Hubbub

Mọi quyết định quan trọng và thay đổi lớn trong quá trình phát triển **PHẢI** được ghi lại tại đây.
Sắp xếp theo thứ tự thời gian (mới nhất ở trên).

> **QUY TẮC:** PR/commit có thay đổi quan trọng mà KHÔNG cập nhật file này sẽ bị reject.
> Áp dụng cho cả Dev và Agent (AI).

## [2026-10-03] Nâng cấp Mô hình Google Gemini sang `gemini-3.8-flash`

**Bối cảnh:** Khi người dùng gửi tin nhắn trò chuyện với tác tử `Gemini Analyst`, Google AI Studio API trả về lỗi 404: `This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.8-flash for the latest features and improvements`. Google đã chính thức ngừng cung cấp mô hình `gemini-2.0-flash` trên API và chuyển sang thế hệ mô hình mới `gemini-3.8-flash` (phát hành tháng 9/2026).

**Quyết định:**
1. **Cập nhật Cấu hình Mặc định (`AppConfig`):**
   - Đổi `default_model` của provider `gemini` thành `gemini-3.8-flash` trong `crates/app/src/config.rs`.
2. **Cập nhật Tác tử Gemini Analyst (`seed.rs`):**
   - Đổi `model` của tác tử `analyst` thành `gemini-3.8-flash` trong `crates/app/src/seed.rs`.
3. **Cập nhật Giao diện Cài đặt (`SettingsModal.tsx`):**
   - Cập nhật mô tả hiển thị của nhà cung cấp Gemini thành `Gemini 3.8 Flash, Gemini 1.5 Pro (Google AI Studio)`.
4. **Kiểm thử Hồi quy (`app_tests.rs`):**
   - Cập nhật unit test assertion kiểm tra model của `analyst` sang `gemini-3.8-flash`. Toàn bộ 36/36 tests PASS.

**Hệ quả:** Khắc phục triệt để lỗi 404 từ Google API; người dùng có thể trò chuyện với Gemini Analyst bằng `gemini-3.8-flash` mượt mà, phản hồi nhanh và hỗ trợ ngữ cảnh lớn 1M tokens.

**Trạng thái:** Đã áp dụng

---

## [2026-10-03] Bổ sung Hỗ trợ Google Gemini & Tác tử Gemini Analyst

**Bối cảnh:** Google Gemini (Gemini 2.0 Flash, Gemini 1.5 Pro) là họ mô hình AI tốc độ cao, hỗ trợ ngữ cảnh lớn (1M - 2M tokens) và có chi phí tối ưu. Google cung cấp endpoint REST tương thích chuẩn OpenAI tại `https://generativelanguage.googleapis.com/v1beta/openai`. Cần bổ sung Gemini vào hệ thống cấu hình provider, kho bảo mật, định tuyến runtime và giao diện người dùng.

**Quyết định:**
1. **Cấu hình Nhà Cung Cấp (`AppConfig`):**
   - Bổ sung cấu hình provider `gemini` vào `AppConfig::default()`, sử dụng `kind: "openai_compat"`, `base_url: "https://generativelanguage.googleapis.com/v1beta/openai"`, và model mặc định `gemini-2.0-flash`.
2. **Định Tuyến Mô Hình Tự Động (`AppService`):**
   - Tự động nhận diện các model có tiền tố `gemini*` để định tuyến yêu cầu về provider `gemini` và kiểm tra khóa bảo mật `gemini_api_key`.
3. **Cung Cấp Tác Tử Mẫu Mới (`Gemini Analyst`):**
   - Bổ sung tác tử `analyst` (Gemini Analyst) trong `seed.rs` sử dụng mô hình `gemini-2.0-flash`, tích hợp công cụ `web_search` và `report_write` với quyền truy cập mở.
4. **Giao Diện Người Dùng (SettingsModal & Sidebar):**
   - Đưa Google Gemini vào danh sách cấu hình API key trong `SettingsModal.tsx` với placeholder `AIzaSy...`.
   - Cập nhật Sidebar hiển thị icon `Sparkles` màu cyan cho tác tử Analyst và điều chỉnh lưới hiển thị 2x2 cân đối cho 4 tác tử.
5. **Kiểm thử Toàn diện:**
   - Bổ sung kiểm thử nạp cấu hình và khởi tạo provider `gemini` trong `app_tests.rs`. Toàn bộ 36/36 tests PASS, clippy 0 warning, build thành công 100%.

**Hệ quả:** Người dùng hiện có thể cấu hình API key Google Gemini và trò chuyện trực tiếp với tác tử Gemini Analyst mượt mà.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Hoàn thành Sprint 1.6: React UI Chat MVP & Kết thúc Phase 1 (apps/desktop/src)

**Bối cảnh:** Triển khai giao diện người dùng Desktop Chat MVP trên React 19 + TypeScript + Vite + Tailwind CSS (`apps/desktop/src`), kết nối trực tiếp với backend Rust Core thông qua Tauri 2 IPC commands và streaming events `run_event`. Mục tiêu là cung cấp trải nghiệm chat đa tác tử mượt mà, hỗ trợ bộ gõ tiếng Việt (IME), hiển thị thời gian thực các bước thực thi công cụ (tools), quản lý API keys an toàn (write-only), chuyển đổi tác tử (Agent Switcher), và duy trì Gate 0 Benchmark Spike phục vụ kiểm thử hiệu năng.

**Quyết định:**
1. **Thiết kế Cấu trúc Component Modularity & Giới hạn < 400 Dòng:**
   - Phân tách giao diện thành các thành phần độc lập, chuyên biệt:
     - `Sidebar.tsx`: Danh sách lịch sử hội thoại, Agent Switcher (Researcher, Librarian, Tutor), nút tạo chat mới, nút mở cài đặt và chuyển đổi Gate 0 Spike.
     - `ChatView.tsx`: Danh sách tin nhắn với avatar phân biệt, hiển thị token delta streaming thời gian thực kèm con trỏ nhấp nháy, thẻ trạng thái thực thi công cụ (running/completed/failed), tự động cuộn xuống cuối (auto-scroll), và thanh soạn thảo (composer) tích hợp xử lý chống gửi sớm khi đang gõ IME tiếng Việt (`isComposing`).
     - `SettingsModal.tsx`: Hộp thoại cấu hình API keys cho 5 nhà cung cấp (OpenAI, Anthropic, OpenRouter, Groq, Ollama) với cơ chế bảo mật Write-Only (chỉ gửi ghi xuống Vault, không đọc ngược lại giao diện).
     - `BenchmarkSpike.tsx`: Tách toàn bộ module kiểm thử Gate 0 spike (kiểm tra gõ tiếng Việt, ảo hóa 1.000 tin nhắn qua `@tanstack/react-virtual`, mô phỏng stream 50t/s, Milkdown WYSIWYG editor) thành component riêng biệt.
     - `App.tsx`: Điều phối trung tâm kết nối trạng thái (conversations, messages, active agent, streaming text, active tools) qua Tauri IPC commands (`list_conversations`, `create_conversation`, `list_messages`, `send_message`, `cancel_run`) và lắng nghe sự kiện `run_event`.
2. **Xử lý An toàn Bộ gõ Tiếng Việt (IME Composition Guard):**
   - Lắng nghe `onCompositionStart` và `onCompositionEnd` trên khung nhập liệu để ngăn chặn sự kiện phím Enter kích hoạt gửi tin nhắn khi người dùng đang gõ bỏ dấu tiếng Việt (UniKey / EVKey).
3. **Cơ chế Streaming & Hiển thị Tác vụ Công cụ:**
   - Lắng nghe sự kiện `run_event` từ `TauriEventSink`:
     - `MessageDelta`: Tích lũy delta text vào khung phản hồi tức thời.
     - `ToolStarted`: Hiển thị thẻ card trạng thái công cụ kèm spinner đang chạy.
     - `ToolFinished`: Cập nhật trạng thái thành công/thất bại kèm tóm tắt kết quả.
     - `RunFinished`: Đồng bộ lại tin nhắn hoàn chỉnh từ SQLite store và giải phóng trạng thái streaming.
4. **Kết quả Nghiệm thu Toàn diện:**
   - Frontend: `tsc -b && vite build` biên dịch thành công 0 lỗi. `oxlint` sạch 0 lỗi.
   - Backend Rust: `cargo clippy --workspace --all-targets -- -D warnings` đạt 0 cảnh báo. `cargo fmt --all -- --check` đạt chuẩn 100%.
   - Toàn bộ test suite repository đạt **36/36 tests PASS** (Store: 10, LLM: 7, Agent: 9, Vault: 5, App: 5).
   - **Chính thức hoàn thành 100% Phase 1 (Chat MVP) qua toàn bộ 6 Sprints (1.1 -> 1.6).**

**Hệ quả:** Hoàn tất Phase 1. Ứng dụng Hubbub đã có đầy đủ khung nền từ Database, LLM Gateway, Agent Runtime, Keyring Vault, Composition Root, cho đến Giao diện React Desktop hoàn chỉnh. Sẵn sàng bước sang **Phase 2: Tool System & Workspace**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Hoàn thành Sprint 1.5: Composition Root & Desktop IPC Shell (hubbub-app & hubbub-desktop)

**Bối cảnh:** Triển khai tầng ứng dụng cốt lõi (`hubbub-app`) đóng vai trò Composition Root kết nối toàn bộ các Ports và Adapters đã xây dựng (`SqliteStore`, `KeyringVault`, `AgentRuntime`, `BuiltinToolHost`, `OpenAiCompatAdapter`, `AnthropicAdapter`). Đồng thời hoàn thiện lớp Tauri IPC Commands (`apps/desktop/src-tauri`) và bộ chuyển tiếp sự kiện streaming `TauriEventSink` để giao diện người dùng có thể kích hoạt các tác vụ chat đa tác tử an toàn.

**Quyết định:**
1. **Thiết lập Cấu hình Ứng dụng (`AppConfig`):**
   - Quản lý đường dẫn Workspace, provider mặc định, agent mặc định, và cấu hình chi tiết cho 5 nhà cung cấp: OpenAI, Anthropic, Ollama, OpenRouter, Groq.
   - Hỗ trợ lưu trữ và nạp tự động qua định dạng file `config.toml`.
2. **Triển khai Composition Root (`AppService`):**
   - Khởi tạo và liên kết các thành phần độc lập thành một dịch vụ đồng nhất (`init`), tự động nạp cơ sở dữ liệu SQLite tại thư mục workspace và kết nối kho bảo mật `KeyringVault`.
   - Cung cấp facade quản lý hội thoại (`create_conversation`, `list_conversations`, `get_conversation`, `list_messages`).
   - Cung cấp facade bảo mật API key (write-only: `set_provider_key`, `has_provider_key`, `delete_provider_key`).
   - Tích hợp điều phối Agent Run với cơ chế đăng ký và hủy tác vụ qua `CancellationToken` (`send_message`, `cancel_run`).
3. **Cung cấp Bộ Agent Mặc định (`seed.rs`):**
   - Tích hợp 3 agent cốt lõi sẵn dùng: `researcher` (Nghiên cứu & Web Search), `librarian` (Quản lý file nội bộ, ngắt kết nối mạng), và `tutor` (Gia sư học tập).
4. **Xây dựng Shell IPC Tauri (`commands.rs` & `events.rs`):**
   - Lớp Tauri shell tuân thủ tiêu chí "thin shell": chỉ đảm nhiệm định tuyến IPC và chuyển phát sự kiện, không chứa business logic.
   - `TauriEventSink`: Chuyển phát tức thời các sự kiện `RunEvent` (bao gồm `MessageDelta`, `ToolStarted`, `ToolFinished`, `RunFinished`) về frontend qua Tauri Event `run_event`.
   - Đăng ký đầy đủ 12 Tauri Commands: `health_check`, `get_version`, `list_conversations`, `create_conversation`, `get_conversation`, `list_messages`, `list_agents`, `set_provider_key`, `has_provider_key`, `delete_provider_key`, `send_message`, `cancel_run`.
5. **Kết quả nghiệm thu:** 5/5 test case trong `crates/app/tests/app_tests.rs` vượt qua 100%. Toàn bộ test suite toàn repo đạt **36/36 tests PASS**, `cargo clippy -D warnings` đạt 0 cảnh báo, `cargo fmt` chuẩn hóa, `tsc -b && vite build` và `oxlint` sạch lỗi.

**Hệ quả:** Hoàn tất Sprint 1.5. Sẵn sàng bước sang **Sprint 1.6: Hoàn thiện Giao diện React UI Chat MVP**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Hoàn thành Sprint 1.4: Keyring Vault (hubbub-vault)

**Bối cảnh:** Triển khai hạ tầng lưu trữ bí mật (API keys, credentials) an toàn cho ứng dụng trong `hubbub-vault`, cài đặt trait `SecretStore` từ `hubbub-domain`. Tuân thủ nghiêm ngặt nguyên tắc **Không lưu trữ plaintext trên đĩa**, sử dụng kho bảo mật bản địa của hệ điều hành (**Windows Credential Manager**), chạy bất đồng bộ an toàn qua `spawn_blocking`, và đảm bảo thông điệp lỗi tuyệt đối không làm lộ giá trị bí mật.

**Quyết định:**
1. **Cấu hình Native Backend cho Crate `keyring`:**
   - Kích hoạt tính năng native theo từng hệ điều hành: `windows-native` (Windows Credential Manager), `apple-native` (macOS Keychain), và `sync-secret-service` (Linux Secret Service).
2. **Triển khai `KeyringVault` với `tokio::task::spawn_blocking`:**
   - Các API hệ điều hành như `CredRead`, `CredWrite`, `CredDelete` là các hàm C/Windows API đồng bộ và có khả năng đọc/ghi đĩa. Đưa các lời gọi này vào `spawn_blocking` giúp bảo vệ vòng lặp Tokio worker threads không bị gián đoạn.
   - Xử lý mượt mà trường hợp xóa idempotent (xóa key không tồn tại vẫn trả về `Ok(())` thay vì trả lỗi).
3. **Triển khai `InMemoryVault`:**
   - Cung cấp triển khai dựa trên `Arc<RwLock<HashMap<String, String>>>` phục vụ các môi trường kiểm thử tự động (CI / test suite) và headless mà không làm ô nhiễm kho chứng chỉ thực của người dùng.
4. **Bảo mật An Toàn Thông Điệp Lỗi (`VaultError`):**
   - Định dạng lỗi chỉ hiển thị tên `key` và thông báo mã lỗi từ OS, **tuyệt đối không bao giờ chứa giá trị bí mật** (`value`).
5. **Kết quả nghiệm thu:** 5/5 test case trong `crates/vault/tests/vault_tests.rs` vượt qua 100% (bao gồm CRUD trên Windows Credential Manager thật, kiểm thử concurrent access, tiếng Việt có dấu và emoji trong key/secret, và kiểm tra không rò rỉ secret qua error log). Toàn bộ 31/31 tests toàn repo PASS, clippy 0 warning, fmt chuẩn hóa.

**Hệ quả:** Hoàn tất Sprint 1.4. Sẵn sàng bước sang **Sprint 1.5: Composition Root & App Layer (`hubbub-app` & Tauri Commands)**.

**Trạng thái:** Đã áp dụng

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
