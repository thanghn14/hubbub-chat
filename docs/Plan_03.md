================================================================================
KẾ HOẠCH TRIỂN KHAI v2.0: PERSONAL MULTI-AGENT CHAT APP (Flutter UI + Rust core)
02/10/2026
================================================================================

0. PHẠM VI & QUYẾT ĐỊNH ĐÓNG BĂNG (muốn đổi phải viết ADR, không đổi ngầm)
--------------------------------------------------------------------------------
Phạm vi v1
  - 1 user, local-first, cá nhân: không đăng nhập, không server, không telemetry.
  - Có: chat văn bản, nhiều agent, điều phối, web, thư mục cục bộ được cấp quyền,
    báo cáo Markdown quản lý tập trung. Không (v1): voice, đồng bộ đa thiết bị.
  - Nền tảng: Windows 10/11 trước; Android ở Phase 5. macOS/Linux: không cam kết.
  - Ưu tiên: RAM thấp, an toàn, dễ review (AI viết code, bạn review).

Stack đóng băng
  UI          Flutter (Dart), desktop Windows rồi Android; KHÔNG WebView
  Core        Rust stable + tokio (pin bằng rust-toolchain.toml); mọi logic nghiệp vụ ở đây
  Cầu nối     flutter_rust_bridge v2 (gọi async, Stream<RunEvent>, huỷ tác vụ)
  Dữ liệu     SQLite (sqlx, WAL, FTS5) + Workspace Markdown (nguồn sự thật cho tài liệu)
  LLM         trait LlmProvider; adapter tự viết: openai_compat, anthropic
  Tools       builtin (Rust) + MCP client (rmcp, bản chính thức)
  Secrets     OS keyring (crate keyring)
  UI          Riverpod (state), go_router, window_manager, package markdown (dart-lang)
              + renderer tự viết; tô màu code ở Rust (syntect)
  Quan sát    tracing + log file + Run inspector
  Dev tools   cargo-nextest, clippy, cargo-deny, flutter analyze/test, just, GitHub Actions

Đã loại có chủ đích
  Node sidecar | HTTP server cục bộ (v1) | framework agent bên thứ ba | GPUI, Slint, egui, iced
  | fork app OSS (chỉ tham khảo: Goose cho agent core, Cherry Studio/Jan cho UX) | serde_yaml
  | Tauri/WebView2 (chỉ là phương án dự phòng nếu Gate 0 trượt, xem Phase 0)

1. THIẾT KẾ HỆ THỐNG
--------------------------------------------------------------------------------
1.1 Kiến trúc phân lớp

  Flutter UI (Dart): chat | agents | files (md viewer/editor) | run inspector | settings
     Chỉ hiển thị và nhập liệu. Không chứa logic nghiệp vụ/quyền; không gọi mạng/FS trực tiếp.
        |  CoreClient (interface Dart): FfiCoreClient (v1), RemoteCoreClient (sau, nếu cần)
        |  flutter_rust_bridge v2: gọi async + Stream<RunEvent>
  bridge    : crate cdylib mỏng, chứa DTO + chuyển đổi, KHÔNG logic
  app       : composition root + use-case facade (nơi DUY NHẤT biết adapter cụ thể)
  agent     : runtime loop, orchestrator, context builder  --->  policy (gate, guards)
  domain    : entity + ports: LlmProvider, ToolHost, Store, Workspace, SecretStore,
              EventSink, Clock       (các adapter bên dưới implement ports này)
  adapters  : llm | tools | mcp | store (sqlx) | workspace (fs) | vault (keyring)
  Bên ngoài : HTTPS (LLM, web) | SQLite app.db | Workspace/*.md | MCP server (tiến trình con)

1.2 Quy tắc phụ thuộc (CI kiểm tra)
  Rust: domain <- policy, agent, adapters <- app <- bridge (scripts/check-deps.sh).
        domain/policy/agent KHÔNG phụ thuộc crate I/O (reqwest, sqlx, notify, keyring).
  Dart: features -> core_client (interface). Cấm dart:io, package:http, Process trong
        lib/features/** và lib/ui/** (scripts/check-ui-imports.sh); I/O nền tảng chỉ ở lib/platform/.

1.3 Mô hình dữ liệu (SQLite; migration chỉ tiến, chỉ thêm; ID = UUID v7)
  conversations(id, title, agent_id, created_at, updated_at, archived)
  messages(id, conversation_id, run_id, role, parts_json, created_at)   -- append-only
      parts: Text | ToolCall | ToolResult | FileRef   (chừa Audio cho voice về sau)
  runs(id, conversation_id, agent_id, parent_run_id, status, usage_json, cost_usd, t0, t1)
  steps(id, run_id, idx, kind[llm|tool|approval], input_json, output_json, status, ts)
  documents(id, path, title, tags, agent_id, run_id, hash, updated_at)
  audit_log(ts, run_id, tool, args_digest, decision, result_digest)
  FTS5 (BM25): messages_fts, documents_fts. Embedding/semantic search: Phase 6.

1.4 Agent = file dữ liệu (sửa prompt/quyền không cần biên dịch lại)
  Workspace/agents/researcher/agent.toml + prompt.md
    id = "researcher"
    model = "anthropic/<model-id>"            # provider/model, khai báo trong config.toml
    [tools]       builtin = ["web_search","web_fetch","report_write","report_read"]
                  mcp = []
    [permissions] fs_read = []  fs_write = ["reports/**"]
                  network = "open"            # none | search_only | allowlist | open
    [budget]      max_steps = 30  max_tokens = 200000  max_cost_usd = 1.0  timeout_s = 600
    [delegation]  can_delegate_to = []
  Validator khi nạp: fs_read khác rỗng VÀ network = "open" => TỪ CHỐI (chống rò rỉ dữ liệu).
  Agent mẫu: researcher (web + ghi báo cáo), librarian (đọc thư mục, network = none),
             tutor (không tool), orchestrator (chỉ delegate).

1.5 Vòng lặp một run
  1) Dựng context: system prompt + lịch sử (đã nén) + schema tool theo quyền.
  2) Gọi LlmProvider (stream) -> phát RunEvent::MessageDelta.
  3) Có tool_call -> policy.check() -> (hỏi phê duyệt?) -> thực thi -> ghi Step -> quay lại 1.
  4) Dừng khi: hết tool_call | hết budget | bị huỷ (CancellationToken) | lỗi không phục hồi.
  Mỗi bước ghi journal TRƯỚC và SAU khi thực thi.

1.6 Harness chất lượng agent (bắt buộc: đây là thứ quyết định chất lượng đầu ra)
  1) Tool schema tốt: tên nhất quán, mô tả nêu rõ khi nào dùng/không dùng, enum thay vì chuỗi
     tự do, kết quả trả về gọn và có cấu trúc.
  2) Quản lý context: nén lịch sử cũ thành tóm tắt; dọn/rút gọn tool result cũ; cắt tool result
     quá dài kèm gợi ý đọc tiếp theo offset; không nhét nguyên trang web/PDF vào context.
  3) Lỗi tool trả về dạng có cấu trúc để model tự sửa; retry có giới hạn; không nuốt lỗi.
  4) Báo cáo bắt buộc có trích dẫn; workflow deep_research có bước verify (đối chiếu luận điểm
     với nguồn).
  5) Tool kế hoạch (todo) cho tác vụ dài; sub-agent chạy với context sạch, trả về bản tóm tắt.
  6) Phần đầu prompt ổn định (tận dụng prompt caching); luôn cấp ngày giờ và ngôn ngữ trả lời.
  7) Run inspector hiển thị đúng context đã gửi, tool call, token, chi phí để gỡ lỗi chất lượng.
  8) Eval: 5-10 golden tasks + checklist chấm điểm; chạy lại khi đổi model/prompt/tool.
  Tham khảo cách tổ chức: mã nguồn Goose (Rust, Apache-2.0). Học ý tưởng, không phụ thuộc trực tiếp.

1.7 Điều phối nhiều agent
  - Mặc định: chat trực tiếp với 1 agent.
  - Supervisor: agent có can_delegate_to dùng tool delegate(agent_id, task) -> run con
    (độ sâu <= 2, budget con trừ từ budget cha, event con lồng vào run cha qua parent_run_id).
  - Workflow cố định (deep_research: plan -> search -> read -> synthesize -> write -> verify):
    state machine Rust dùng chung primitive của runtime. Làm ở Phase 3.
  - Tối đa 4 run đồng thời; semaphore riêng cho từng provider.

1.8 Bảo mật (thực thi ở Rust, KHÔNG dựa vào prompt)
  - Không có WebView: UI không thực thi HTML/JS từ nội dung => không có lớp XSS. Renderer
    Markdown không tự tải ảnh/link từ xa; link mở qua core (open_external) kèm xác nhận, chỉ http/https.
  - PathGuard: canonicalize; chặn symlink thoát root, "..", UNC/ADS/tên thiết bị Windows;
    tool chỉ ghi được reports/** và notes/**; agents/ và config bất khả xâm phạm với tool.
  - UrlGuard (SSRF): chỉ http/https; resolve DNS rồi kiểm IP (loopback, private, link-local,
    169.254.169.254, IPv6 tương đương); kiểm lại mỗi redirect (tối đa 5); giới hạn 5MB, timeout.
  - Nội dung không tin cậy (web/file) bọc trong thẻ <untrusted> + system prompt nhắc; test bằng
    FakeLlm "ngoan ngoãn làm theo injection" để chứng minh policy chặn được, độc lập với LLM.
  - Phê duyệt 3 mức: auto | ask_once_per_run | always_ask. Mặc định: đọc web = auto,
    ghi reports/notes = auto, xoá/ghi ngoài scope = always_ask, MCP tool lần đầu = always_ask.
  - Secrets: keyring; UI chỉ ghi, không đọc lại; không vào log/context LLM.
  - MCP: chỉ server khai báo trong config, pin phiên bản/hash, cwd riêng, lọc biến môi trường;
    cấm "npx -y" không pin.
  - Audit log cho mọi tool call, xem được trong Run inspector.

1.9 Hiệu năng & RAM
  - Mục tiêu (đo ở Gate 0 và Phase 4): idle <= 150MB với 1.000 tin nhắn; cold start < 2s.
  - UI: ListView.builder (lazy); chỉ giữ ~100-200 tin gần nhất trong bộ nhớ, tải trang cũ khi
    cuộn; cache AST Markdown theo message id, xoá khi ra khỏi cửa sổ; tin đang stream chỉ parse
    lại block cuối; gom delta 16-32ms trước khi cập nhật UI.
  - Core: tokio multi-thread, SQLite WAL, pool <= 4, indexing chạy nền, giới hạn kích thước
    tool result.
  - Font bundle đầy đủ dấu tiếng Việt (Noto Sans hoặc Inter + font mono).

1.10 Workspace & báo cáo Markdown
  Workspace/ (mặc định Documents\<App>Workspace\)
    agents/  reports/  notes/  sources/  .versions/ (giữ 20 bản cũ/file)
  - Front matter phẳng: id, title, agent, run, sources, tags, created, updated. Parser tự viết
    (~50 dòng) cho tập con phẳng, không phụ thuộc crate YAML. Tương thích Obsidian/VS Code.
  - Mọi ghi file qua Workspace service: ghi tạm -> fsync -> rename; lưu bản cũ vào .versions.
  - notify watcher (debounce 300ms) -> reindex khi sửa ngoài app; bỏ qua self-write bằng hash.
  - Chỉ mục tài liệu luôn dựng lại được từ Workspace.
  Dữ liệu app: %APPDATA%\<App>\ (config.toml, app.db, logs\, backups\). Profile dev: <App>-dev.
  Dart truyền data_dir/workspace_dir/profile vào core qua init_app() khi khởi động.

1.11 Bề mặt CoreClient (trung lập transport, để RemoteCoreClient thay được sau này)
  init_app(dirs, profile) | send_message(conv, agent, content) -> Stream<RunEvent>
  cancel_run(run_id) | resolve_approval(run_id, approval_id, allow|deny)
  list/create/archive conversation | list/get agent | list/read/write document | search
  get/set settings | set/clear secret (write-only) | list runs | get run tree | open_external(url)
  RunEvent: MessageDelta, ToolStarted, ApprovalRequired, ToolFinished, RunFinished, Error,
            DocumentsChanged

2. CÔNG NGHỆ & CÔNG CỤ (pin phiên bản chính xác khi khởi tạo repo, ghi vào ADR-0002)
--------------------------------------------------------------------------------
Rust: tokio, tokio-util | serde, serde_json, toml | sqlx (sqlite, query runtime-checked, migrate)
  | reqwest (rustls) + eventsource-stream | rmcp (client, child-process, streamable-http; pin chính xác)
  | keyring | notify | tracing, tracing-subscriber, tracing-appender | thiserror, anyhow
  | uuid (v7) | time | url + ipnet | scraper + htmd (HTML -> Markdown) | syntect (tô màu code)
  | pdfium-render (PDF, Phase 3) | async-trait | sha2/blake3 | flutter_rust_bridge (bridge)
Rust dev: cargo-nextest, wiremock (giả lập LLM HTTP), insta (snapshot event stream),
  proptest (PathGuard/UrlGuard), cargo-deny (advisories, bans, sources)
Dart: flutter_riverpod | go_router | window_manager | file_picker | path_provider
  | markdown (dart-lang) | flutter_rust_bridge | flutter_lints + analysis_options strict
  (strict-casts, strict-inference, strict-raw-types)
Dart dev: flutter_test (kèm golden test cho renderer Markdown), integration_test
Chung: Git + GitHub (private), Conventional Commits, trunk-based | GitHub Actions (windows-latest)
  | just | Renovate/Dependabot (gộp 1 PR/tháng) | sccache
  Máy dev Windows cần: Rust (MSVC), Flutter, Visual Studio 2022 workload "Desktop C++".
  Profile dev Rust: deps opt-level=2. Release: lto=thin, strip.
Dịch vụ ngoài: Brave Search API (mặc định) qua trait SearchProvider (thay được SearXNG/Tavily).
Tiêu chí thêm dependency: tên tuổi/số người dùng, maintainer còn hoạt động, phát hành gần đây,
  ít unsafe, cây phụ thuộc nhỏ. Ghi 3-4 dòng vào ADR-lite trước khi thêm.

3. CẤU TRÚC CODE BASE (Cargo workspace + 1 Flutter app)
--------------------------------------------------------------------------------
personal-agent/
|- Cargo.toml (workspace + [workspace.lints])  rust-toolchain.toml  rustfmt.toml  deny.toml
|- justfile  .github/workflows/ci.yml  renovate.json
|- docs/
|   |- architecture.md  threat-model.md  runbook.md  ai-workflow.md
|   '- adr/0001-stack.md  0002-rust-core.md  0003-workspace-md-truth.md  0007-flutter-ui.md ...
|- scripts/                     # check-deps.sh, check-ui-imports.sh, gen-bridge.sh
|- crates/
|   |- domain/     # entity, value object, ports (trait), error. Không I/O
|   |- policy/     # Permission, ApprovalTier, PathGuard, UrlGuard, validator agent
|   |- agent/      # runtime (loop, budget, cancel), orchestrator, context (nén, cắt tool result)
|   |- llm/        # openai_compat.rs, anthropic.rs, sse.rs, retry.rs
|   |- tools/      # web_search, web_fetch, fs_read, report_*, delegate, todo (builtin)
|   |- mcp/        # server registry, spawn + cách ly env, cầu nối tool -> ToolHost
|   |- store/      # sqlx repos, migrations/, fts
|   |- workspace/  # md service: atomic write, front matter, versions, watcher, indexer
|   |- vault/      # SecretStore (keyring)
|   |- app/        # composition root, use-case facade, config loader, backup
|   |- bridge/     # cdylib cho flutter_rust_bridge: DTO + chuyển đổi, KHÔNG logic
|   '- testkit/    # FakeLlm, record/replay cassette, tmp workspace, fixtures
|- apps/
|   '- desktop/                  # Flutter app (Windows trước, Android sau: cùng project)
|       |- pubspec.yaml  analysis_options.yaml  flutter_rust_bridge.yaml
|       |- lib/
|       |   |- main.dart
|       |   |- app/            # router, theme, providers, shell layout
|       |   |- core_client/    # core_client.dart (interface), ffi_core_client.dart, generated/
|       |   |- features/       # chat/ agents/ files/ runs/ settings/ (widget + controller)
|       |   |- ui/             # design system, markdown/ (parser -> renderer, code block)
|       |   '- platform/       # nơi DUY NHẤT được dùng dart:io (cửa sổ, hộp thoại chọn thư mục)
|       |- assets/fonts/       # đủ dấu tiếng Việt
|       |- test/  integration_test/
|       '- windows/            # (android/ thêm ở Phase 5)
|- resources/agents/           # agent mặc định, seed vào Workspace lần chạy đầu
'- (sau này) apps/headless/    # axum + WebSocket cho RemoteCoreClient: CHƯA tạo ở v1

4. VIỆC CẦN LÀM (ước lượng 1 dev full-time có AI; part-time nhân ~2,5)
--------------------------------------------------------------------------------
Phase 0: Nền móng + GATE 0 (~1 tuần)
  [ ] Cài toolchain (Rust MSVC, Flutter, VS C++); repo, workspace lints, CI Windows xanh
  [ ] ADR 0001-0006; threat-model v0; docs/ai-workflow.md (quy trình AI + checklist review)
  [ ] Đọc kiến trúc Goose 1-2 ngày (agent loop, provider, MCP, approval), ghi chú lại
  [ ] GATE 0 (2-3 ngày, pass/fail rõ ràng): spike UI trên máy bạn
      1) Gõ tiếng Việt bằng UniKey, EVKey và Telex Windows vào ô chat + ô sửa Markdown: gõ
         nhanh, sửa giữa chuỗi, undo, dán: không mất/lặp/sai dấu.
      2) Markdown mẫu (tiêu đề, bảng, code, danh sách, link) với font Việt; chọn/copy văn bản;
         stream 50 token/s không giật.
      3) 1.000 tin nhắn: cuộn mượt; RAM (Private Working Set) <= 150MB và thấp hơn rõ rệt app
         WebView2 bạn đã làm, đo cùng máy.
      4) flutter_rust_bridge: Stream Rust -> Dart chạy 1 giờ, huỷ tác vụ ổn, RAM không tăng đều.
      5) Android: build debug chạy được "hello core" (chỉ ghi nhận rủi ro, không chặn).
      Đạt 1-4: chốt Flutter (ADR-0007), không đổi nữa. Trượt 1-3: chuyển sang phương án dự phòng
      đã định (Tauri 2 + React + tối ưu WebView2: MemoryUsageTargetLevel Low khi ẩn/thu nhỏ,
      suspend khi minimize). Core Rust giữ nguyên, chỉ thay bridge + UI.
  Xong khi: CI xanh; Gate 0 có kết quả ghi vào ADR-0007.

Phase 1: MVP chat (~3-4 tuần)
  [ ] domain + store: conversations/messages/agents, migrations, test repo
  [ ] llm: openai_compat + anthropic (stream, tool-call, usage), retry; test bằng wiremock
  [ ] agent runtime v1: loop, budget, cancel, journal, nén context cơ bản, cắt tool result
  [ ] vault (keyring) + màn hình Settings (provider, key ghi-một-chiều)
  [ ] bridge + CoreClient + UI chat: stream, Markdown renderer v1 (cache AST, parse block cuối),
      danh sách hội thoại (phân trang), chọn agent
  Xong khi: chat ổn định với 2 provider và 2 agent; hội thoại 1.000 tin nhắn mượt, RAM đạt
  mục tiêu; kill app giữa chừng không hỏng dữ liệu.

Phase 2: Web + báo cáo (~3 tuần)
  [ ] policy: UrlGuard, PathGuard, approval + hộp thoại phê duyệt, audit log
  [ ] tools: web_search, web_fetch; report_write/read/list
  [ ] workspace service: ghi nguyên tử, versions, front matter, watcher, FTS
  [ ] UI Files: cây thư mục, xem Markdown, sửa (ô nhập đa dòng + preview song song), tìm kiếm,
      "Lưu thành báo cáo"; tô màu code bằng syntect
  Xong khi: Researcher tạo báo cáo có trích dẫn, lưu vào Workspace; sửa ngoài app vẫn được
  reindex; bộ test injection (trang web độc hại) đều bị policy chặn.

Phase 3: Thư mục cục bộ + MCP + đa agent (~4-5 tuần)
  [ ] fs_read/list/search theo allowlist (UI quản lý nguồn), PDF -> text
  [ ] mcp crate: registry, cách ly env, bật/tắt theo agent, phê duyệt tool
  [ ] orchestrator: delegate, run lồng nhau, Run inspector (timeline, context, token, chi phí)
  [ ] Validator agent; workflow deep_research (có bước verify); bộ eval golden tasks
  Xong khi: Orchestrator giao việc cho Researcher + Librarian; inspector hiển thị cây run;
  eval chạy được và có điểm số cơ sở.

Phase 4: Hardening & vận hành (~2 tuần)
  [ ] integration_test smoke, property test cho guards, benchmark (cold start, RAM, chat dài)
  [ ] Backup tự động + thử restore, backup trước migration, xuất diagnostics
  [ ] Đóng gói (flutter build windows + Inno Setup), xoay vòng log, trần chi phí theo tháng
  [ ] Rà soát bảo mật theo threat-model, viết runbook
  Xong khi: checklist mục 5 đạt; dùng thật 2 tuần không mất dữ liệu.

Phase 5: Android (khi cần). UI Flutter dùng chung; chọn topology tại thời điểm đó:
  (A) Core nhúng trong app Android (Rust .so qua flutter_rust_bridge): thay adapter vault ->
      Android Keystore, workspace -> SAF (qua plugin Kotlin), MCP chỉ HTTP, chạy nền bằng
      foreground service.
  (B) Thêm apps/headless (axum + WebSocket) chạy trên desktop/home server, Android dùng
      RemoteCoreClient qua WireGuard/Tailscale. Chọn B nếu cần một nguồn dữ liệu duy nhất.
Phase 6+ (backlog): embedding + sqlite-vec, công thức LaTeX, Zotero/arXiv, flashcards (FSRS),
  agent theo lịch, voice (cắm vào port Speech).

5. LƯU Ý TRIỂN KHAI & VẬN HÀNH
--------------------------------------------------------------------------------
Làm việc với AI (vì bạn review, AI viết)
  - Contract-first: (1) viết spec ngắn + trait + test case, (2) bạn duyệt test, (3) AI cài đặt,
    (4) CI xanh, (5) bạn review theo checklist. PR nhỏ (<= ~400 dòng diff), luôn kèm test.
  - Rust "đơn giản" (ghi vào ai-workflow.md): dùng owned type + Arc, trait object ở ports,
    async-trait; tránh lifetime trên struct công khai, macro tự viết, generic phức tạp;
    file < 400 dòng, hàm < 60 dòng.
  - Workspace lints: forbid(unsafe_code) (trừ code sinh tự động của bridge); deny unwrap_used,
    expect_used, panic, todo, dbg_macro, await_holding_lock; clippy -D warnings.
  - Checklist review Rust: (1) có unwrap/expect? (2) giữ lock qua .await? (3) tác vụ nền có
    CancellationToken? (4) channel có giới hạn? (5) lỗi có ngữ cảnh? (6) đường dẫn/URL có đi qua
    guard? (7) log có lộ secret/prompt? (8) có test cho nhánh lỗi?
  - Cho AI thứ hai review chéo theo checklist trước khi bạn duyệt; bạn là người chốt.
  - Học tối thiểu (1-2 tuần): ownership/borrowing, Result và "?", Arc/Mutex, async/tokio.
Phát triển
  - Luôn chạy dev với profile riêng (APP_PROFILE=dev): tách app.db, Workspace, keyring khỏi
    dữ liệu thật.
  - Không sửa migration đã áp dụng; DB mới hơn binary thì app từ chối mở.
  - Adapter LLM: test conformance bằng fixture ghi sẵn cho từng provider (tool-call stream từng
    phần, khác biệt của Ollama/OpenRouter); LLM thật chỉ dùng trong bộ eval chạy tay.
  - Prompt/agent file nằm trong Git; thay đổi quyền của agent review như thay đổi code.
  - flutter_rust_bridge: gom dữ liệu stream nhỏ, không chuyển payload lớn qua cầu nối; chạy lại
    codegen trong CI và báo lỗi nếu file sinh ra bị lệch.
  - Renderer Markdown là thành phần rủi ro nhất của UI: golden test cho tiêu đề, bảng, code,
    link, nội dung tiếng Việt, và test hiệu năng với tin nhắn dài.
Bảo mật
  - Agent không được ghi vào agents/, config, hay nơi chứa định nghĩa quyền của chính nó.
  - Mặc định deny; mọi mở rộng quyền phải rõ ràng trong agent.toml và hiện trong UI.
  - Log mặc định không chứa prompt đầy đủ hay khoá; chế độ verbose phải bật chủ động.
  - Chuỗi cung ứng: commit Cargo.lock và pubspec.lock; cargo deny + dart pub outdated trong CI;
    cập nhật theo lô hằng tháng; MCP server pin phiên bản.
Vận hành
  - Windows: keyring = Credential Manager; bản cài cần VC++ runtime (Inno Setup đóng kèm).
  - Backup: app.db (VACUUM INTO) hằng đêm, giữ 14 bản; Workspace là file thường, tự backup bằng
    công cụ của bạn (OneDrive/Syncthing/Git). Dữ liệu tách khỏi thư mục cài nên nâng cấp an toàn;
    rollback = cài lại bản cũ + restore backup.
  - Chi phí: ghi usage mỗi run, bảng giá model trong config.toml (cập nhật tay), trần theo run
    và theo tháng; vượt trần thì dừng và báo.
  - Không cần auto-update/code signing cho dùng cá nhân; cài bản mới bằng installer.
Rủi ro chính
  - Gõ tiếng Việt/RAM của Flutter -> Gate 0 trước khi viết code sản phẩm; có phương án dự phòng.
  - Prompt injection        -> policy ở Rust + validator + test injection tự động.
  - Chất lượng agent        -> 8 hạng mục harness, Run inspector, eval golden tasks.
  - Phình scope             -> mỗi phase có "Xong khi"; chỉ làm lát cắt dọc chạy được.
  - Rust review khó         -> contract-first, lint nghiêm, checklist, PR nhỏ.
  - Phụ thuộc provider      -> trait + 2 adapter + fallback + trần chi phí.
  - rmcp còn trẻ            -> pin chính xác, bọc sau ToolHost, test với server mẫu.
Definition of Done v1.0
  [ ] Chat 2 provider, >= 3 agent, delegate hoạt động   [ ] Báo cáo MD tạo/sửa/tìm được
  [ ] Test injection xanh                               [ ] RAM/cold start đạt mục tiêu
  [ ] Backup + restore đã thử thật                      [ ] CI xanh (clippy -D warnings, deny)
  [ ] Runbook + threat-model cập nhật                   [ ] Eval golden tasks có điểm cơ sở
================================================================================