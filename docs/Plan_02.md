╔══════════════════════════════════════════════════════════════════════════════╗
║         PERSONAL AI WORKSPACE / RESEARCH CHAT APP — MASTER PLAN           ║
║                         Desktop First → Android                            ║
╚══════════════════════════════════════════════════════════════════════════════╝


0. ĐỊNH HƯỚNG SẢN PHẨM
──────────────────────────────────────────────────────────────────────────────
Mục tiêu:
- Ứng dụng AI cá nhân, chỉ 1 user.
- Nhiều Agent chuyên môn, có thể phối hợp theo workflow.
- Chat bằng Text + Voice.
- Agent có Internet access và File/Folder access có kiểm soát.
- Quản lý tập trung Conversation / Agent / Workspace / Document / Report.
- Agent tạo Artifact, đặc biệt Markdown.
- Hỗ trợ học tập, nghiên cứu, tổng hợp tài liệu, viết báo cáo.
- Local-first, privacy-first, offline-capable ở mức hợp lý.
- Desktop trước; kiến trúc sẵn sàng cho Android.

Nguyên tắc cốt lõi:
1. LLM KHÔNG phải security authority.
2. Agent KHÔNG truy cập OS trực tiếp.
3. Mọi hành động → Tool Gateway → Policy Engine → OS/External Service.
4. Open Source được ưu tiên nhưng không đánh đổi security/maintainability.
5. Core domain của sản phẩm phải độc lập với OSS framework cụ thể.
6. Modular Monolith trước; chỉ tách service khi thực sự cần.
7. File/Markdown là first-class data, không chỉ là attachment.
8. Mọi Agent execution phải có Run/Step/State/Trace.
9. Thiết kế platform-neutral từ đầu để tái sử dụng cho Android.
10. Không xây lại những thành phần OSS đã đủ trưởng thành.


1. KIẾN TRÚC TỔNG THỂ
──────────────────────────────────────────────────────────────────────────────

                         ┌──────────────────┐
                         │       USER       │
                         └────────┬─────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────┐
                 │       DESKTOP UI               │
                 │   Tauri 2 + React + TypeScript │
                 └───────────────┬────────────────┘
                                 │ IPC
                                 ▼
                 ┌────────────────────────────────┐
                 │          RUST APP CORE         │
                 │                                │
                 │ Conversation                   │
                 │ Agent Runtime                  │
                 │ Workflow / Orchestrator        │
                 │ Model Gateway                  │
                 │ Tool Gateway                   │
                 │ Policy / Permission Engine     │
                 │ Workspace / Document           │
                 │ Research / Citation            │
                 │ Voice Gateway                  │
                 │ Memory                         │
                 │ Scheduler                      │
                 │ Audit / Observability          │
                 └───────┬──────────┬─────────────┘
                         │          │
                 ┌───────▼───┐  ┌───▼─────────────┐
                 │  SQLite   │  │   Workspace     │
                 │  + FTS5   │  │ Markdown/Files  │
                 └───────────┘  └─────────────────┘
                         │
              ┌──────────┴───────────┐
              ▼                      ▼
       ┌─────────────┐       ┌──────────────────┐
       │  LOCAL AI   │       │     EXTERNAL     │
       │             │       │                  │
       │ Ollama      │       │ Cloud LLM        │
       │ llama.cpp   │       │ Web/Search       │
       │ whisper.cpp │       │ External APIs    │
       └─────────────┘       └──────────────────┘


2. KIẾN TRÚC ỨNG DỤNG
──────────────────────────────────────────────────────────────────────────────

Pattern:
- Modular Monolith.
- Clean / Hexagonal Architecture.
- Domain-driven module boundaries.
- Async execution bằng Rust/Tokio.
- Dependency Inversion.
- Event-driven ở các workflow/run quan trọng.

Các tầng:

Presentation
    ↓
Application
    ↓
Domain
    ↓
Ports / Interfaces
    ↑
Infrastructure

Không cho:
UI → SQLite trực tiếp
UI → filesystem trực tiếp
Agent → OS trực tiếp
Agent → HTTP trực tiếp
Agent → shell trực tiếp

Mọi resource access phải đi qua application/security boundary.


3. CÁC MODULE CHÍNH
──────────────────────────────────────────────────────────────────────────────

A. Conversation
- Conversation
- Message
- Attachment
- Message branch
- Streaming response
- Retry / regenerate
- Conversation search

B. Agent
- Agent
- AgentVersion
- Agent configuration
- System instruction
- Model profile
- Tool list
- Workspace scope
- Capability scope
- Budget

C. Agent Runtime
- Prompt/context assembly
- Tool-call loop
- Structured output
- Cancellation
- Retry
- Step limit
- Token budget
- Time limit

D. Workflow / Orchestrator
- Workflow
- Node
- Edge
- Run
- RunStep
- Checkpoint
- Resume
- Parallel execution
- Human approval
- Failure/retry policy

E. Tool System
- Tool Registry
- Native Tools
- MCP Tools
- Tool schema
- Tool validation
- Tool execution
- Tool result normalization

F. Security / Policy
- Capability model
- Permission policy
- Workspace ACL
- Approval policy
- URL/network policy
- Process policy
- Secret access policy
- Audit events

G. Workspace
- Workspace
- WorkspaceRoot
- File
- Folder
- Document
- DocumentVersion
- Artifact

H. Research
- Source
- Source snapshot
- Citation
- Evidence
- Research session
- Search result
- Document chunk

I. Memory
- Conversation memory
- Project memory
- Explicit user memory
- Semantic retrieval
- Memory lifecycle/policy

J. Voice
- STT
- VAD
- TTS
- Voice session
- Audio streaming
- Interrupt/cancel

K. Model Gateway
- Cloud providers
- Ollama
- llama.cpp
- Future providers
- Text generation
- Tool calling
- Embeddings
- Vision
- Model capability discovery

L. Platform
- Filesystem
- Secure storage
- Notifications
- Clipboard
- Audio
- OS integration
- App lifecycle

M. Observability
- Structured logs
- Run tracing
- Tool tracing
- Error reporting
- Metrics
- Diagnostics


4. OPEN SOURCE STRATEGY
──────────────────────────────────────────────────────────────────────────────

PRIORITY 1 — DÙNG TRỰC TIẾP
────────────────────────────
- Tauri 2
- React
- TypeScript
- Vite
- Rust
- Tokio
- SQLite
- SQLite FTS5
- SQLx
- Ollama
- llama.cpp
- whisper.cpp
- Milkdown hoặc CodeMirror 6


PRIORITY 2 — INTEGRATE QUA ABSTRACTION
───────────────────────────────────────
- MCP / official Rust SDK (rmcp)
- MarkItDown
- PydanticAI hoặc agent framework tương lai
- Vector/embedding engine
- Search providers
- TTS engine
- Document parsers
- OCR


PRIORITY 3 — REFERENCE / NGHIÊN CỨU
───────────────────────────────────
LobeChat:
- Agent UX
- Knowledge UX
- MCP / plugin UX
- Artifact UX
- Multi-model UX
- Conversation branching

Chatbot UI:
- Chat UX
- Message rendering
- Streaming UX
- Model selector
- Conversation UX
- UI component patterns
- Persistence/data modeling

Open WebUI / LibreChat / AnythingLLM / Khoj / OpenHands:
- nghiên cứu riêng từng capability;
- không đưa nguyên architecture của chúng vào core.


QUY TẮC OSS
───────────
Mỗi dependency trước khi đưa vào production phải kiểm tra:
- License
- Transitive dependencies
- Security advisories
- Maintainer/activity
- Release stability
- Platform compatibility
- Memory/CPU footprint
- Data privacy
- Supply-chain risk
- Exit strategy

Tạo:
docs/oss/oss-matrix.md
docs/oss/third-party-notices.md
docs/oss/license-policy.md

Ưu tiên:
MIT / Apache-2.0 / BSD / Public Domain

Các license/copyleft hoặc license có điều kiện:
- phải được review riêng;
- không mặc định đưa vào binary/product;
- rà cả dependency transitives.


5. STACK CÔNG NGHỆ CHỐT CHO V1
──────────────────────────────────────────────────────────────────────────────

Desktop Shell:
- Tauri 2

Frontend:
- React
- TypeScript
- Vite
- TanStack Query
- Zustand (hoặc state library tương đương)
- Tailwind CSS
- Milkdown cho Markdown editor
- CodeMirror 6 cho code/config editor

Backend/Core:
- Rust
- Tokio
- Serde
- Tracing
- thiserror / anyhow ở boundary phù hợp

Database:
- SQLite
- WAL
- Foreign keys
- Transactions
- FTS5

DB Access:
- SQLx

Local AI:
- Ollama
- llama.cpp

Speech:
- whisper.cpp
- Native OS TTS ở V1

Document:
- MarkItDown
- Các parser bổ sung chỉ thêm khi cần

Protocol:
- MCP + rmcp
- nhưng MCP không phải security boundary

Testing:
- Rust unit/integration tests
- TypeScript tests
- E2E
- Security tests


6. DATABASE — V1
──────────────────────────────────────────────────────────────────────────────

Core:
Profile
Setting

AI:
Agent
AgentVersion
ModelProvider
ModelProfile

Conversation:
Conversation
ConversationBranch
Message
Attachment

Execution:
Run
RunStep
RunEvent
Workflow
WorkflowNode
WorkflowEdge
Checkpoint
ApprovalRequest

Tools:
Tool
ToolVersion
ToolPolicy
Capability
PermissionGrant

Workspace:
Workspace
WorkspaceRoot
FileEntry
Document
DocumentVersion
Artifact

Research:
Source
SourceSnapshot
DocumentChunk
Citation
Evidence
ResearchSession

Memory:
MemoryItem
MemoryEmbedding

Voice:
VoiceSession

System:
AuditEvent
ScheduledJob

Không dùng vector DB riêng trong V1.
Bắt đầu bằng:
SQLite + FTS5
Sau đó mới thêm embeddings/vector search.


7. WORKSPACE / FILESYSTEM
──────────────────────────────────────────────────────────────────────────────

User cấp:
D:\Study
D:\Research
D:\Projects

App tạo logical abstraction:
workspace://study/...
workspace://research/...
workspace://projects/...

Agent chỉ thao tác logical path.

Ví dụ:
workspace://research/reports/report.md

Policy:
Agent A:
- read: research/**
- write: research/reports/**
- web: allow
- shell: deny

Agent B:
- read/write: projects/**
- shell: approval required

Phải chống:
- ../ traversal
- absolute path abuse
- symlink/junction escape
- UNC path
- private/system directories
- path canonicalization bypass
- TOCTOU


8. TOOL / CAPABILITY MODEL
──────────────────────────────────────────────────────────────────────────────

Tool:
filesystem.read
filesystem.write
workspace.search
web.search
web.fetch
document.convert
document.read
document.write
citation.create
notification.send
clipboard.read
clipboard.write
...

Mỗi Tool có:
- id
- version
- input schema
- output schema
- capabilities
- risk level
- side effects
- timeout
- max output
- approval requirement

Risk levels:
LOW
MEDIUM
HIGH
CRITICAL

Ví dụ:
filesystem.read      → LOW/MEDIUM
filesystem.write     → HIGH
delete_file          → CRITICAL
shell.execute        → CRITICAL
git.push              → CRITICAL


9. SECURITY MODEL
──────────────────────────────────────────────────────────────────────────────

Security principle:
Least Privilege + Explicit Capability + Human-in-the-loop

Agent KHÔNG:
- toàn quyền filesystem
- toàn quyền network
- toàn quyền shell
- truy cập secrets
- tự sửa policy

Tool execution:
Agent
  ↓
Schema validation
  ↓
Policy Engine
  ↓
Capability check
  ↓
Approval (nếu cần)
  ↓
Sandbox/Worker
  ↓
Execution
  ↓
Audit
  ↓
Result

Secrets:
- OS Keychain / Credential Manager / secure storage
- Không lưu API key plaintext trong SQLite
- Frontend không giữ secrets không cần thiết

Network:
- validate URL
- SSRF protection
- block localhost/private/link-local/internal ranges khi không được phép
- giới hạn redirect
- timeout
- response-size limit
- content-type validation

Untrusted content:
- Web content = untrusted
- File content = untrusted
- PDF/document = untrusted
- Không để prompt injection override policy

CRITICAL:
- Shell execution OFF trong V1
- Plugin/MCP server chạy trong vùng hạn quyền
- Tool process crash không được làm chết App Core


10. MCP ARCHITECTURE
──────────────────────────────────────────────────────────────────────────────

Tool Gateway
    │
    ├── NativeToolAdapter
    │
    └── MCPToolAdapter
             │
             └── MCP Server

MCP chỉ là interoperability layer.

MCP không được phép:
- bypass Policy Engine
- mở rộng filesystem scope
- tự cấp network permission
- tự nâng capability
- truy cập secret store trực tiếp

External MCP:
- disabled by default
- explicit installation
- explicit permission
- version pinning
- integrity verification
- resource limits


11. AGENT ARCHITECTURE
──────────────────────────────────────────────────────────────────────────────

Agent =
Identity
+ Instructions
+ Model Profile
+ Tools
+ Capabilities
+ Workspace Scope
+ Budget
+ Policy
+ Version

Ví dụ:
Research Agent
- web.search
- web.fetch
- document.read
- citation.create
- read research/**
- write research/reports/**
- max 20 steps
- max 10 min
- shell denied

Agent không tự do gọi Agent khác.

Multi-Agent:
User
 ↓
Supervisor / Planner
 ↓
Workflow DAG
 ├── Researcher A
 ├── Researcher B
 ├── Source Analyzer
 ├── Fact Checker
 └── Writer
 ↓
Citation Validator
 ↓
Markdown Artifact


12. WORKFLOW ENGINE
──────────────────────────────────────────────────────────────────────────────

Workflow phải hỗ trợ:

QUEUED
RUNNING
WAITING_TOOL
WAITING_APPROVAL
PAUSED
COMPLETED
FAILED
CANCELLED

Mỗi Run:
- id
- agent
- workflow
- model
- started_at
- finished_at
- status
- token usage
- cost estimate
- trace

Budget:
- max steps
- max tool calls
- max tokens
- max runtime
- max parallel agents
- max network requests
- max file reads/writes

Phải có:
- cancellation
- checkpoint
- resume
- retry
- timeout
- dead-loop detection


13. RESEARCH / KNOWLEDGE PIPELINE
──────────────────────────────────────────────────────────────────────────────

Input:
PDF / DOCX / PPTX / XLSX / TXT / HTML / URL / Markdown
                    ↓
              Ingestion
                    ↓
             Parser / Converter
                    ↓
                 Markdown
                    ↓
              Normalization
                    ↓
          Metadata + Content Hash
                    ↓
            Chunking / Indexing
                 ┌──┴──┐
                 ▼     ▼
                FTS   Embedding
                 └──┬──┘
                    ▼
               Retrieval
                    ↓
          Evidence + Citation
                    ↓
                 Agent

Mục tiêu:
- mỗi claim quan trọng có source;
- giữ URL;
- giữ thời gian fetch;
- giữ snapshot/hash khi phù hợp;
- tránh citation hallucination.


14. DOCUMENT / ARTIFACT SYSTEM
──────────────────────────────────────────────────────────────────────────────

Artifact types:
- Markdown
- Code
- JSON
- HTML
- CSV
- Image
- Diagram
- Dataset
- Report

Markdown là first-class artifact.

Lifecycle:
CREATED
  ↓
EDITED
  ↓
VERSIONED
  ↓
VALIDATED
  ↓
ARCHIVED

Mỗi Document:
- metadata trong SQLite
- content/file trong Workspace
- version
- content hash
- related Run
- related Agent
- related Sources/Citations


15. VOICE
──────────────────────────────────────────────────────────────────────────────

Microphone
   ↓
Audio buffer
   ↓
VAD
   ↓
STT
   ↓
Message(text)
   ↓
Agent Runtime
   ↓
Response(text)
   ↓
TTS
   ↓
Audio output

Voice và Text phải dùng cùng Conversation/Agent core.

V1:
- STT local bằng whisper.cpp
- TTS Native OS
- Push-to-talk trước
- Streaming/interrupt ở phase sau


16. CODE BASE
──────────────────────────────────────────────────────────────────────────────

personal-ai/
│
├── apps/
│   └── desktop/
│       ├── frontend/
│       │   ├── src/
│       │   │   ├── app/
│       │   │   ├── components/
│       │   │   ├── features/
│       │   │   │   ├── chat/
│       │   │   │   ├── agents/
│       │   │   │   ├── workflows/
│       │   │   │   ├── workspace/
│       │   │   │   ├── documents/
│       │   │   │   ├── research/
│       │   │   │   ├── voice/
│       │   │   │   └── settings/
│       │   │   ├── hooks/
│       │   │   ├── stores/
│       │   │   ├── services/
│       │   │   ├── types/
│       │   │   └── routes/
│       │   └── tests/
│       │
│       └── src-tauri/
│
├── crates/
│   ├── domain/
│   ├── application/
│   ├── agent/
│   ├── workflow/
│   ├── conversation/
│   ├── tools/
│   ├── mcp/
│   ├── security/
│   ├── model/
│   ├── web/
│   ├── workspace/
│   ├── document/
│   ├── research/
│   ├── memory/
│   ├── voice/
│   ├── storage/
│   ├── platform/
│   └── observability/
│
├── migrations/
│
├── schemas/
│   ├── agent/
│   ├── tool/
│   ├── workflow/
│   └── api/
│
├── tests/
│   ├── integration/
│   ├── security/
│   ├── e2e/
│   └── fixtures/
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── security/
│   ├── oss/
│   ├── api/
│   └── operations/
│
├── scripts/
│
├── Cargo.toml
└── README.md


17. CÁC VIỆC CẦN LÀM — THEO PHASE
──────────────────────────────────────────────────────────────────────────────

PHASE 0 — ARCHITECTURE / FOUNDATION
───────────────────────────────────
[ ] Product requirements
[ ] Architecture Decision Records
[ ] Threat model
[ ] OSS technology radar
[ ] License policy
[ ] Repository + CI
[ ] Tauri project
[ ] React/TS frontend
[ ] Rust workspace
[ ] SQLite migration system
[ ] Logging/tracing
[ ] Secure secret storage
[ ] App configuration
[ ] Error-handling standard


PHASE 1 — CHAT MVP
──────────────────
[ ] Conversation CRUD
[ ] Message CRUD
[ ] Streaming
[ ] Model Gateway
[ ] Cloud provider adapter
[ ] Ollama adapter
[ ] Stop/cancel generation
[ ] Retry/regenerate
[ ] Conversation search
[ ] Markdown rendering
[ ] Basic settings

Definition of Done:
- chat ổn định;
- app restart không mất data;
- stream/cancel/retry hoạt động;
- lỗi model không crash application.


PHASE 2 — AGENT
───────────────
[ ] Agent CRUD
[ ] AgentVersion
[ ] Model Profile
[ ] Tool Registry
[ ] Tool schema
[ ] Agent Runtime
[ ] Run Manager
[ ] Step tracing
[ ] Budget
[ ] Cancellation
[ ] Retry
[ ] Agent permissions


PHASE 3 — WORKSPACE
───────────────────
[ ] Workspace CRUD
[ ] Root registration
[ ] Path validation
[ ] File browser
[ ] File read
[ ] Safe write
[ ] Markdown editor
[ ] Document version
[ ] Artifact manager
[ ] File watcher nếu cần


PHASE 4 — WEB + RESEARCH
─────────────────────────
[ ] web.search
[ ] web.fetch
[ ] URL validation
[ ] SSRF protection
[ ] HTML extraction
[ ] Source persistence
[ ] Snapshot/hash
[ ] Citation model
[ ] Evidence model
[ ] Research workspace
[ ] Research report generation


PHASE 5 — DOCUMENT INTELLIGENCE
────────────────────────────────
[ ] MarkItDown pipeline
[ ] PDF/DOCX/PPTX/XLSX ingestion
[ ] Content normalization
[ ] Metadata
[ ] Chunking
[ ] FTS5
[ ] Retrieval API
[ ] Optional embeddings
[ ] Permission-aware retrieval


PHASE 6 — MULTI-AGENT
─────────────────────
[ ] Workflow definition
[ ] DAG execution
[ ] Supervisor
[ ] Planner
[ ] Parallel Agent execution
[ ] Checkpoint
[ ] Resume
[ ] Approval UI
[ ] Failure recovery
[ ] Agent-to-Agent result passing
[ ] Run visualization


PHASE 7 — VOICE
───────────────
[ ] Microphone permission
[ ] Audio pipeline
[ ] VAD
[ ] whisper.cpp
[ ] TTS
[ ] Voice session
[ ] Interrupt
[ ] Push-to-talk
[ ] Voice settings


PHASE 8 — MEMORY
────────────────
[ ] Explicit memory
[ ] Conversation memory
[ ] Project memory
[ ] Retrieval
[ ] Memory expiration/deletion
[ ] User controls
[ ] Optional vector search


PHASE 9 — HARDENING
───────────────────
[ ] Threat-model review
[ ] Prompt-injection tests
[ ] Path traversal tests
[ ] SSRF tests
[ ] Tool abuse tests
[ ] Permission escalation tests
[ ] Secret leakage tests
[ ] Malicious document tests
[ ] Dependency audit
[ ] SBOM
[ ] Crash testing
[ ] Recovery testing
[ ] Backup/restore testing


PHASE 10 — RELEASE
───────────────────
[ ] Windows installer
[ ] Code signing
[ ] Auto updater
[ ] Migration strategy
[ ] Rollback strategy
[ ] Crash diagnostics
[ ] User backup/export
[ ] Release notes
[ ] Versioned DB migrations
[ ] Production checklist


PHASE 11 — ANDROID
──────────────────
KHÔNG port nguyên desktop một cách máy móc.

[ ] Reuse domain/application logic
[ ] Reuse API contracts
[ ] Android-specific filesystem adapter
[ ] Android permissions
[ ] Android secure storage
[ ] Android microphone
[ ] Android notifications
[ ] Background execution
[ ] Battery constraints
[ ] Android-specific UI/UX
[ ] Mobile AI capability assessment

Mục tiêu:
Shared Core
+
Platform Adapter
+
Platform UI


18. FRONTEND UX
──────────────────────────────────────────────────────────────────────────────

Main layout:

Sidebar
├── Conversations
├── Workspaces
├── Agents
├── Research
├── Documents
└── Settings

Center
└── Conversation

Right Context Panel
├── Agent
├── Model
├── Active Tools
├── Workspace
├── Sources
└── Run details

Composer:
- text input
- attach file
- microphone
- model selector
- agent selector
- send/stop

Run Inspector:
- plan
- tool calls
- sources
- agent steps
- token usage
- errors
- approvals


19. PERFORMANCE
──────────────────────────────────────────────────────────────────────────────

Mục tiêu:
- UI responsive.
- Streaming response không block UI.
- DB operations async.
- Large file processing không chạy trên main thread.
- Long-running Agent chạy worker.
- Bounded concurrency.
- Bounded queue.
- Cache hợp lý.
- Không load toàn bộ conversation/file vào RAM.
- File parsing/inference phải có memory limit.

Theo dõi:
- startup time
- UI frame responsiveness
- first-token latency
- generation latency
- DB latency
- tool latency
- memory usage
- CPU usage
- GPU usage
- document ingestion throughput


20. WORKER / ISOLATION
──────────────────────────────────────────────────────────────────────────────

Main Process:
- UI
- orchestration
- database
- policy
- lifecycle

Worker:
- document parsing
- Web extraction
- STT/TTS
- heavy model operations
- future code execution

Rủi ro cao:
- untrusted parser
- external binaries
- shell
- code execution

→ process isolation
→ timeout
→ output limit
→ kill capability
→ restricted filesystem
→ restricted network


21. DATA / PRIVACY
──────────────────────────────────────────────────────────────────────────────

Mặc định:
- Local data first.
- Không gửi file/chat lên cloud nếu user chưa chọn provider/action.
- Hiển thị rõ khi dữ liệu được gửi ra ngoài.
- Tách local model và cloud model.
- Không log raw secrets.
- Có thể disable telemetry.
- Audit log local.

Cloud call phải biết:
- provider
- model
- dữ liệu nào gửi
- reason/context
- timestamp


22. BACKUP / RECOVERY
──────────────────────────────────────────────────────────────────────────────

Backup bao gồm:
- SQLite DB
- Workspace metadata
- Markdown files
- Agent definitions
- Workflows
- Settings metadata

Có:
- Export
- Import
- Backup
- Restore
- Integrity check

DB migration:
- versioned
- backward compatibility strategy
- failed migration rollback/recovery


23. VERSIONING
──────────────────────────────────────────────────────────────────────────────

Version:
App
Core schema
Agent
AgentVersion
ToolVersion
WorkflowVersion
ModelProfile

Mỗi Run phải ghi:
- agent_version
- workflow_version
- model/provider
- relevant configuration

Không silently thay đổi behavior của Agent cũ.


24. TESTING STRATEGY
──────────────────────────────────────────────────────────────────────────────

Unit:
- Domain
- Policy
- Path validation
- URL validation
- Agent state
- Workflow transitions

Integration:
- SQLite
- Tool Gateway
- Model Gateway
- Workspace
- MCP

Security:
- Prompt injection
- Path traversal
- SSRF
- Permission escalation
- Malicious MCP
- Tool abuse
- Secret leakage

E2E:
- Chat
- Agent run
- File read/write
- Research
- Report creation
- Voice
- Backup/restore

Chaos/Failure:
- model timeout
- provider unavailable
- worker crash
- DB locked
- malformed file
- network failure
- cancelled workflow


25. CI/CD
──────────────────────────────────────────────────────────────────────────────

On every PR:
[ ] format
[ ] lint
[ ] typecheck
[ ] unit tests
[ ] integration tests
[ ] dependency audit
[ ] license scan
[ ] security scan

Release pipeline:
Source
 ↓
Build
 ↓
Test
 ↓
Security
 ↓
SBOM
 ↓
Sign
 ↓
Package
 ↓
Release
 ↓
Update channel

Channels:
- dev
- beta
- stable

Không tự động update dependency major.


26. OBSERVABILITY
──────────────────────────────────────────────────────────────────────────────

Mỗi Run có Trace:

Run
 ├── Agent step
 ├── Model call
 ├── Tool call
 ├── MCP call
 ├── File operation
 ├── Web request
 └── Artifact creation

UI có:
- Run timeline
- Error
- Tool arguments/result summary
- Source list
- Token/cost info
- Approval history

Không log:
- API secrets
- passwords
- sensitive raw contents nếu không cần.


27. APP OPERATIONS
──────────────────────────────────────────────────────────────────────────────

Khi App đang chạy:
- graceful shutdown
- cancel running workers
- persist pending state
- recover interrupted runs
- DB integrity check
- recover corrupted/incomplete artifact

Khi update:
- backup/migration
- install new version
- run DB migration
- health check
- rollback nếu migration thất bại

Khi crash:
- preserve DB
- preserve Run state
- write crash diagnostic
- app khởi động lại → recovery


28. NHỮNG THỨ CỐ TÌNH KHÔNG LÀM Ở V1
──────────────────────────────────────────────────────────────────────────────

Không:
- Microservices
- Kubernetes
- Redis
- Kafka
- Postgres
- Dedicated vector database
- Agent swarm tự do
- unrestricted shell
- unrestricted filesystem
- unrestricted MCP
- custom document parser cho mọi định dạng
- custom STT engine
- custom LLM inference engine

Chỉ thêm khi có bottleneck/requisite thực tế.


29. DECISION RECORDS CẦN TẠO
──────────────────────────────────────────────────────────────────────────────

ADR-001  Tauri 2
ADR-002  React + TypeScript
ADR-003  Rust Core
ADR-004  Modular Monolith
ADR-005  SQLite + FTS5
ADR-006  Model Gateway
ADR-007  Tool Gateway
ADR-008  Capability-based Security
ADR-009  Workspace Abstraction
ADR-010  MCP Integration
ADR-011  Custom Agent Runtime
ADR-012  Workflow DAG
ADR-013  Markdown-first Artifacts
ADR-014  Local-first Data Strategy
ADR-015  Desktop → Android Strategy


30. V1 MVP DEFINITION
──────────────────────────────────────────────────────────────────────────────

V1 chỉ cần hoàn thành hoàn hảo:

1. Chat
2. Model Gateway
3. Agent
4. Tool System
5. Permission System
6. Workspace
7. Markdown Document
8. Web Research
9. Citation
10. Basic Multi-Agent Workflow
11. Voice STT
12. Backup/Restore
13. Run/Trace
14. Secure Settings

MVP chưa cần:
- advanced memory
- sophisticated vector DB
- marketplace
- arbitrary code execution
- cloud synchronization
- collaboration
- multi-user


31. RELEASE GATE — CHỈ RELEASE KHI
──────────────────────────────────────────────────────────────────────────────

FUNCTIONAL:
[ ] Core use cases hoạt động ổn định
[ ] Agent có thể dùng tool
[ ] Agent có thể đọc/ghi đúng workspace
[ ] Research có citation
[ ] Markdown report tạo được
[ ] Voice hoạt động

SECURITY:
[ ] Không bypass permission
[ ] Không path traversal
[ ] Không SSRF
[ ] Không secret leakage
[ ] Prompt injection không vượt policy
[ ] External tools bị giới hạn

RELIABILITY:
[ ] Worker crash không crash app
[ ] Run có thể cancel
[ ] Failed run có thể retry
[ ] App restart có recovery
[ ] Backup/restore verified

PERFORMANCE:
[ ] UI không block
[ ] Large files không làm treo UI
[ ] Bounded memory
[ ] Bounded concurrency

MAINTAINABILITY:
[ ] ADR đầy đủ
[ ] Test coverage cho core
[ ] Migration tested
[ ] OSS/license inventory
[ ] Dependency versions controlled


32. KIẾN TRÚC CUỐI CÙNG CẦN GIỮ ỔN ĐỊNH
──────────────────────────────────────────────────────────────────────────────

                    USER
                      │
                      ▼
             ┌─────────────────┐
             │   Tauri 2 UI    │
             │ React + TS      │
             └────────┬────────┘
                      │ IPC
                      ▼
             ┌─────────────────┐
             │   APPLICATION   │
             │      CORE       │
             └────────┬────────┘
                      │
         ┌────────────┼──────────────┐
         ▼            ▼              ▼
      AGENT        WORKFLOW        MEMORY
         │            │              │
         └────────────┼──────────────┘
                      ▼
                TOOL GATEWAY
                      │
                POLICY ENGINE
                      │
       ┌──────────────┼───────────────┐
       ▼              ▼               ▼
     Native          MCP             OS
     Tools           Tools         Resources
       │
       ├── Filesystem
       ├── Web
       ├── Documents
       ├── Search
       ├── Voice
       └── Notifications

                      +
             MODEL GATEWAY
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
     Ollama        llama.cpp       Cloud

                      +
              WORKSPACE LAYER
                      │
                Markdown/Files
                      │
               SQLite + FTS5


33. TRIẾT LÝ THIẾT KẾ
──────────────────────────────────────────────────────────────────────────────

"Own the boundaries, reuse the engines."

Tự kiểm soát:
- Domain
- Agent behavior
- Workflow
- Policy
- Permission
- Workspace
- Security boundary
- Data model
- Application lifecycle

Tận dụng OSS:
- UI framework
- Desktop runtime
- Async runtime
- Database
- Search
- LLM runtime
- STT
- Markdown editor
- Document conversion
- MCP protocol
- Testing/tooling

Kết quả mong muốn:

Một Personal AI Workspace:
- nhỏ gọn
- local-first
- bảo mật
- có thể offline
- có nhiều Agent
- có khả năng nghiên cứu thật
- có file/document lifecycle rõ ràng
- có workflow nhiều bước
- có khả năng mở rộng Android
- không bị khóa vào một LLM provider
- không bị khóa vào một Agent framework
- không bị khóa vào một OSS project duy nhất