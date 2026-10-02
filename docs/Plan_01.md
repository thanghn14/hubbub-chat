# BẢN KẾ HOẠCH TỔNG THỂ: THIẾT KẾ, TRIỂN KHAI & VẬN HÀNH
# DỰ ÁN: PERSONAL RESEARCH AGENT APP (DESKTOP)
# Vai trò: CTO & Solution Architect
# Phiên bản: 1.0 (Q3/2026)

================================================================================
I. KIẾN TRÚC HỆ THỐNG & LUỒNG DỮ LIỆU (SYSTEM DESIGN)
================================================================================

1. Mô hình Phân tầng (Decoupled Modular Architecture):
   Hệ thống gồm 2 thực thể tiến trình (Process) độc lập chạy cục bộ trên máy:
   - Process 1 (Frontend Shell): Tauri v2 (Rust) điều phối cửa sổ native, bảo mật 
     hệ thống tệp (I/O) và Webview UI (React 19 + Milkdown).
   - Process 2 (Agent Engine): Python FastAPI chạy dưới dạng Sidecar nhị phân độc lập, 
     quản lý LangGraph State Machine và thực thi các Tools.

2. Sơ đồ Luồng Dữ liệu (Data Flow):
   [User: Voice/Text] 
          │
          ▼
   [Tauri Webview UI] ──(HTTP POST /api/chat)──> [FastAPI (localhost:8765)]
                                                        │
                                                        ▼
                                                [Supervisor Agent]
                                                  ├── Phân rã mục tiêu
                                                  ├── Gọi [Researcher] (Web Search)
                                                  ├── Gọi [DocReader] (Local Files)
                                                  └── Gọi [Writer] (Tổng hợp GFM)
                                                        │
   [Tauri Webview UI] <──(SSE Stream: Token + Steps)───┤
          │                                             ▼
          │                                     [Ghi file .md vào Vault]
          │                                             │
   [Rust FileWatcher] <────────(FS Event: FileCreated)──┘
          │
          ▼ (IPC Event)
   [Milkdown Editor]: Tự động mở và render tài liệu vừa sinh.

================================================================================
II. STACK CÔNG NGHỆ & BỘ CÔNG CỤ (TECH STACK SELECTION)
================================================================================

1. Client Shell & Giao diện (Desktop):
   - Desktop Runtime: Tauri v2 (Rust) — Dung lượng bundle <15MB, RAM ~40-60MB.
   - UI Core: React 19, TypeScript, Vite, TailwindCSS, shadcn/ui, Lucide Icons.
   - Markdown Engine: Milkdown (WYSIWYG trên nền ProseMirror), hỗ trợ GFM, KaTeX, Mermaid.
   - Quản lý State: Zustand (UI state) + Fetch EventSource (Xử lý SSE streaming).

2. Agent Engine Backend:
   - Framework: Python 3.11+, FastAPI, Uvicorn (ràng buộc IP 127.0.0.1).
   - Agent Orchestration: LangGraph (StateGraph với mô hình Supervisor - Workers).
   - Document Parser & RAG: Docling / PyMuPDF4LLM + FastEmbed (nhúng cục bộ) + Qdrant Local.
   - Search Engine: Tavily Search API hoặc SearXNG (Self-hosted / Public instance).
   - Voice Processing:
     * STT (Nghe): Web Speech API (nhẹ) hoặc Whisper API / whisper.cpp cục bộ.
     * TTS (Nói): Edge-TTS (Chất lượng phòng thu, đa ngôn ngữ, chi phí 0đ).

================================================================================
III. CẤU TRÚC THƯ MỤC CODE BASE (MONOREPO)
================================================================================

personal-research-agent/
├── apps/
│   ├── desktop/                           # Desktop Shell (Tauri v2 + React 19)
│   │   ├── src-tauri/                     # Native Layer (Rust)
│   │   │   ├── src/
│   │   │   │   ├── commands/              # IPC APIs: file_system.rs, watcher.rs, sidecar.rs
│   │   │   │   └── main.rs                # App entry, Sidecar lifecycle & port scanner
│   │   │   ├── tauri.conf.json            # Cấu hình Sidecar binary, permissions, window specs
│   │   │   └── Cargo.toml
│   │   └── src/                           # Frontend UI
│   │       ├── components/
│   │       │   ├── layout/                # ActivityBar (48px), Resizable SplitView (40/60)
│   │       │   ├── chat/                  # MessageStream, AgentProcessCard, InputDock, VoiceWaveform
│   │       │   └── vault/                 # FileTree, Breadcrumb, MilkdownEditor, BubbleMenu
│   │       ├── features/                  # useChatStream (SSE), useVaultFiles, useVoiceRecording
│   │       ├── stores/                    # useAppStore (Agents/UI state), useVaultStore (Active file)
│   │       └── App.tsx
│   │
│   └── agent-core/                        # AI Engine (Python FastAPI Sidecar)
│       ├── app/
│       │   ├── api/                       # Routes: /chat (SSE stream), /voice, /health
│       │   ├── agents/                    # LangGraph State Machine
│       │   │   ├── state.py               # AgentState Pydantic Schema
│       │   │   ├── graph.py               # Biên dịch đồ thị điều phối Supervisor
│       │   │   └── nodes/                 # supervisor.py, researcher.py, doc_reader.py, writer.py
│       │   ├── tools/                     # web_search.py, local_reader.py, vault_writer.py
│       │   ├── core/                      # security.py (Canonical Path validation), config.py
│       │   └── main.py                    # Server startup (Uvicorn 127.0.0.1)
│       ├── pyproject.toml                 # uv / poetry dependencies
│       └── build.spec                     # PyInstaller configuration (Single Binary)
│
├── packages/
│   └── shared-types/                      # Event schemas (SSE data contract, Agent Status types)
├── scripts/                               # Scripts build packaging (.msi, .dmg, .AppImage)
└── Makefile                               # Quản lý build: make dev, make build, make package

================================================================================
IV. KẾ HOẠCH TRIỂN KHAI CHI TIẾT (WORK BREAKDOWN STRUCTURE)
================================================================================

[Giai đoạn 1] Phát triển Lõi Agent Backend (Sprint 1 - 7 ngày)
- [ ] Thiết lập FastAPI service, cấu hình chặt chẽ CORS (chỉ chấp nhận `localhost`).
- [ ] Xây dựng bộ Tools:
      * `search_web`: Tích hợp Tavily / DuckDuckGo.
      * `read_local_docs`: Trích xuất text từ PDF, Word, Markdown bằng Docling/PyMuPDF.
      * `write_vault_report`: Kiểm tra đường dẫn an toàn và xuất file `.md`.
- [ ] Xây dựng LangGraph Workflow: Supervisor điều phối 3 Worker chạy tuần tự hoặc song song.
- [ ] Kiểm thử luồng xử lý và đo đạc độ trễ phản hồi qua API docs.

[Giai đoạn 2] Xây dựng Desktop Shell & Markdown Vault (Sprint 2 - 7 ngày)
- [ ] Khởi tạo dự án Tauri v2 với template React 19 + TypeScript + TailwindCSS.
- [ ] Xây dựng bố cục Split-View (Cột trái: Chat/Agent, Cột phải: Markdown Editor).
- [ ] Tích hợp trình soạn thảo Milkdown với đầy đủ plugin GFM, KaTeX, Mermaid.
- [ ] Viết Rust IPC Commands quản lý File System cục bộ (Đọc cây thư mục, mở file, lưu file).
- [ ] Tích hợp Rust FileWatcher để tự động bắt sự kiện khi Agent ghi file mới vào ổ đĩa.

[Giai đoạn 3] Tích hợp SSE Stream, Tương tác Giọng nói & UI Polish (Sprint 3 - 5 ngày)
- [ ] Xây dựng SSE Endpoint tại FastAPI; Client dùng `fetchEventSource` render token stream.
- [ ] Thiết kế `AgentProcessCard` hiển thị trực quan các bước suy nghĩ và log hoạt động.
- [ ] Tích hợp Voice Pipeline:
      * STT: Web Audio ghi âm, gửi audio blob lên endpoint Whisper.
      * TTS: FastAPI stream audio từ Edge-TTS về giao diện để phát âm thanh.
- [ ] Tinh chỉnh giao diện theo chuẩn "Editorial Minimalism" (Bảng màu tối Zinc, font Geist).

[Giai đoạn 4] Đóng gói Sản phẩm & Vận hành Thử nghiệm (Sprint 4 - 4 ngày)
- [ ] Sử dụng PyInstaller đóng gói `agent-core` thành 1 file binary duy nhất.
- [ ] Cấu hình Tauri Sidecar để kích hoạt binary khi mở app và dọn tiến trình khi đóng app.
- [ ] Đóng gói bộ cài đặt: Windows (.msi/exe), macOS (.dmg), Linux (.AppImage).
- [ ] Viết tài liệu hướng dẫn cấu hình API Key và chọn thư mục Workspace lần đầu.

================================================================================
V. CÁC NGUYÊN TẮC BẢO MẬT & HIỆU NĂNG TRỌNG YẾU (CRITICAL CONSIDERATIONS)
================================================================================

1. An toàn & Bảo mật (Security & Isolation):
   - Ngăn chặn Path Traversal (Tuyệt đối):
     Tất cả thao tác file của Agent phải thông qua kiểm tra Canonical Path:
     `os.path.realpath(target).startswith(os.path.realpath(vault_root))`
     Từ chối mọi thao tác có ký tự `..` hoặc symlink trỏ ra ngoài thư mục được chỉ định.
   - Nguyên tắc thực thi an toàn:
     Không cung cấp công cụ `eval()`, `bash`, `powershell`. Mọi hành vi hệ điều hành
     được thu hẹp vào các hàm đọc/ghi tệp được khai báo tĩnh (Static-typed functions).
   - Bảo vệ API Keys:
     Lưu API keys vào OS Credential Store (thông qua thư viện `keyring`), không lưu
     dưới dạng plain-text trong file `.env` hoặc cấu hình giao diện.
   - Cách ly dữ liệu Web không tin cậy (Prompt Injection Defense):
     Mọi nội dung cào từ Internet hoặc tài liệu trích xuất phải được bọc trong thẻ
     xml: `<external_context>...</external_context>` kèm chỉ dẫn rõ ràng cho LLM.

2. Hiệu năng & Tối ưu Tài nguyên (Performance & Memory):
   - Non-blocking I/O: Xử lý tìm kiếm web và đọc tài liệu nặng bất đồng bộ bằng
     `asyncio.gather()` để không làm nghẽn tiến trình API.
   - Tiết kiệm RAM: Tránh nhúng Electron hay Chromium đầy đủ. Sử dụng Tauri Webview
     giữ mức chiếm dụng RAM của toàn ứng dụng dưới 120MB khi chạy tải thông thường.
   - Token Streaming: Dùng Server-Sent Events (SSE) để tạo độ phản hồi tức thì (<1s),
     tránh việc người dùng phải chờ 30-40s để xem toàn bộ báo cáo nghiên cứu.

================================================================================
VI. TRIỂN KHAI, VẬN HÀNH & NÂNG CẤP (DAY-2 OPERATIONS)
================================================================================

1. Quản lý Vòng đời Tiến trình (Process Lifecycle Management):
   - Tự động gán cổng: Tauri khởi động Sidecar và chỉ định cổng khả dụng (mặc định
     8765, tự động đổi nếu bị trùng cổng) thông qua tham số dòng lệnh `--port`.
   - Cơ chế Graceful Shutdown: Khi người dùng đóng ứng dụng hoặc nhấn phím tắt tắt app,
     Tauri bắt sự kiện `CloseRequested` và gửi tín hiệu `SIGTERM` đến Python Sidecar,
     chờ tối đa 2 giây trước khi ép buộc dừng (tránh tình trạng tiến trình chạy ngầm).

2. Bảo trì & Lưu trữ (Data Persistence & Logs):
   - Dữ liệu Vault: Lưu trữ dưới dạng plain Markdown thông thường; người dùng có thể
     đồng bộ trực tiếp qua Git, Syncthing, Dropbox hoặc iCloud mà không qua trung gian.
   - Ghi Log hệ thống: Ghi log có giới hạn dung lượng (Rotating File Handler: tối đa
     3 file x 5MB) lưu tại thư mục dữ liệu cục bộ (`%APPDATA%` hoặc `~/Library/Logs`).

3. Chiến lược Nâng cấp Tương lai (Future Extensibility):
   - Thêm Agent mới: Thêm một Node mới vào đồ thị LangGraph và đăng ký schema công cụ
     trong `agent-core`; giao diện tự động nhận diện và cập nhật trạng thái mà không
     cần sửa đổi layout cốt lõi.
   - Mở rộng sang Mobile: Kiến trúc sẵn sàng chuyển đổi khi Tauri v2 hỗ trợ compile
     sang mobile; chuyển FastAPI backend lên VPS cá nhân và kết nối qua HTTPS/WSS.