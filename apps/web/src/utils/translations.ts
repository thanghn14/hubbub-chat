export const translations = {
  en: {
    nav: {
      brandName: 'Hubbub Chat',
      shortName: 'Hubbub',
      versionBadge: 'v0.1.0',
      licenseBadge: 'Apache 2.0',
      subtitle: 'Personal Multi-Agent AI Studio',
      agents: 'Agent Team',
      features: 'Features',
      security: 'Rust Security',
      architecture: 'Architecture',
      compare: 'Compare',
      faq: 'FAQ',
      download: 'Download for Windows',
      starOnGithub: 'Star on GitHub'
    },
    hero: {
      pillTag: 'Hubbub Chat v0.1.0 Released',
      pillDesc: 'Apache 2.0 Open Source • Native Rust Core',
      title1: 'The Sovereign ',
      titleHighlight: 'Multi-Agent AI Studio',
      title2: ' for Deep Research.',
      subtitle:
        'A desktop AI workspace engineered with a native Rust core. Coordinate autonomous agents, browse & digest research with capability-based security, and craft living Markdown reports—100% private under the Apache License 2.0.',
      ctaDownload: 'Download Hubbub Chat',
      ctaDownloadSub: 'v0.1.0 • 64-bit • Apache 2.0 Open Source',
      ctaDemo: 'Explore Agent Team',
      ctaGithub: 'GitHub Repository',
      quote: '"Built in Rust. Your data never leaves your machine without explicit permission."',
      metrics: {
        local: {
          title: '100% Local-First',
          desc: 'Zero telemetry & zero lock-in'
        },
        security: {
          title: 'Rust Policy Engine',
          desc: 'PathGuard & UrlGuard gating'
        },
        ram: {
          title: '< 30MB RAM Footprint',
          desc: 'Native speed with Tauri 2'
        },
        license: {
          title: 'Apache License 2.0',
          desc: 'Permissive open-source license'
        }
      },
      mockup: {
        windowTitle: 'Hubbub Chat v0.1.0 — Desktop AI Studio',
        workspaceTitle: 'Workspace: Research / Small Language Models (SLMs)',
        tabChat: 'Agent Chat View',
        tabReport: 'Milkdown Report',
        agentTeamTitle: 'Coordinated Agents',
        agentReady: '4 Ready',
        vaultPath: 'Local Vault Path',
        policyActive: 'Rust Policy Engine: Enforced',
        userRole: 'You (Research Lead)',
        userPrompt:
          'Compare current 3B-parameter reasoning architectures (e.g. DeepSeek-R1-Distill, Qwen2.5-Math). Verify local benchmark logs from our workspace and pull paper citations.',
        orchestratorPlan:
          'Dispatched concurrent sub-tasks: Researcher querying arXiv papers, while Librarian reads local benchmark files.',
        urlApproved: 'UrlGuard: arxiv.org (Approved)',
        pathApproved: 'PathGuard: /benchmarks.json (Approved)',
        tutorArtifact: 'Milkdown Artifact Generated',
        openInEditor: 'Open in Editor →',
        tutorSummary:
          'Key insight: DeepSeek-R1-Distill-Qwen-1.5B outperforms 7B baselines on GSM8K (82.3%) while running locally at 68 tokens/s with under 2.1GB VRAM.',
        inputPlaceholder: 'Ask your agent team or command /search, /read, /synthesize...'
      }
    },
    agents: {
      badge: 'Interactive Multi-Agent Runtime',
      title: 'Coordinated Agents. Zero Chaos.',
      subtitle:
        'In Hubbub Chat, agents do not run in chaotic uncontrolled loops. A central Orchestrator plans every step, delegates to vetted specialists, and passes every I/O action through native Rust capability guards.',
      orchestrator: {
        role: 'Supervisor',
        name: 'Orchestrator',
        tagline: 'Decomposition & Execution Loops',
        desc: 'Breaks complex user goals into acyclic execution graphs. Tracks step budgets, monitors sub-agent progress, and handles fallback logic.',
        meta: 'Bounded Step Budget'
      },
      researcher: {
        role: 'Web & arXiv',
        name: 'Researcher',
        tagline: 'Literature & External Evidence',
        desc: 'Searches the public web, extracts preprints, and fetches targeted documents. Every HTTP request is strictly filtered by UrlGuard.',
        meta: 'UrlGuard Protection'
      },
      librarian: {
        role: 'Local Vault',
        name: 'Librarian',
        tagline: 'Filesystem & SQLite FTS5',
        desc: 'Indexes your local workspace, reads PDF/code/markdown files, and performs sub-millisecond full-text queries via SQLite FTS5.',
        meta: 'PathGuard Sandboxing'
      },
      tutor: {
        role: 'Synthesis',
        name: 'Tutor',
        tagline: 'Socratic Teaching & Reports',
        desc: 'Transforms raw findings into publication-ready Markdown reports in Milkdown WYSIWYG editor. Verifies citations and Socratic counter-arguments.',
        meta: 'Milkdown Artifacts'
      },
      simulation: {
        badge: 'Live Orchestration Simulation',
        title: 'Inspect Real-time Run & Trace Execution',
        reset: 'Reset',
        simulatedGoal: 'Simulated Research Goal',
        step: 'Step',
        of: 'of',
        back: 'Back',
        next: 'Next Step',
        guardEnforcement: 'Rust Capability Guard Enforcement',
        gateBlocked: 'GATE BLOCKED',
        verifiedSafe: 'VERIFIED SAFE',
        runtimeTrace: 'Runtime Trace Log (Sub-process stream)',
        resolution: 'Step Resolution & Output'
      }
    },
    bento: {
      badge: 'Engineered for Deep Work',
      title: 'Built Like a Precision Instrument',
      subtitle:
        'Every layer of Hubbub Chat is engineered for uncompromising speed, strict data sovereignty, and cognitive clarity under Apache 2.0.',
      card1: {
        badge: 'Core Security',
        tag: 'Hard Boundary in Rust',
        title: 'Capability-Based Policy Engine',
        desc: 'LLMs are unpredictable and must never act as a security authority. In Hubbub, every disk read, file write, and network packet must pass through a native Rust Policy Engine with capability tokens.',
        sub1Title: 'PathGuard Sandboxing',
        sub1Desc: 'Canonicalizes all filesystem paths. Hard-blocks directory traversal (../), symlink escapes, and ungranted system directories.',
        sub2Title: 'UrlGuard & SSRF Shield',
        sub2Desc: 'Prevents agents from probing internal IP ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16). Enforces domain allowlists.'
      },
      card2: {
        badge: 'Zero Bloat',
        title: '< 30MB RAM Footprint',
        desc: 'Built on Tauri 2 and Rust rather than shipping a full Chrome browser in Electron. Startup takes under 180ms, leaving all RAM for AI models.',
        hubbubLabel: 'Hubbub Chat (Tauri 2)',
        electronLabel: 'Typical Electron Apps'
      },
      card3: {
        badge: 'Artifact Studio',
        title: 'Milkdown WYSIWYG',
        desc: 'Research should not disappear into endless chat streams. Markdown is a first-class citizen, rendered in an integrated WYSIWYG editor with live math and tables.',
        subTitle: 'Zero Context Waste',
        subDesc: 'Agents edit the document collaboratively, keeping synthesis clean and exportable to GitHub, Obsidian, or PDF.'
      },
      card4: {
        badge: 'Execution Guarantees',
        tag: 'Deterministic DAG',
        title: 'Deterministic Run / Step / Trace Loop',
        desc: 'Every single agent action runs within a strict bounded step budget. View full intermediate reasoning traces, pause execution at any moment.',
        sub1Title: 'Step Budget Cap',
        sub1Val: 'Hard-coded bounds',
        sub1Desc: 'Stops run-away token burn',
        sub2Title: 'Full Trace History',
        sub2Val: 'Every Prompt & Output',
        sub2Desc: 'Exportable audit trail',
        sub3Title: 'Supervisor Approval',
        sub3Val: 'Human-in-the-Loop',
        sub3Desc: 'Click to authorize actions'
      },
      card5: {
        badge: 'Offline Intelligence',
        title: 'SQLite + FTS5',
        desc: 'All your knowledge, chat history, and reports are stored locally in an open SQLite database with full-text search index (FTS5).',
        subTitle: 'Sub-5ms Query Latency',
        subDesc: 'Instant full-corpus recall'
      },
      card6: {
        badge: 'Open & Sovereign',
        title: 'Bring Your Own Keys, Offline AI & Apache 2.0',
        desc: 'Free and open source under the Apache License 2.0. Connect local models in Ollama / llama.cpp for absolute offline privacy, or plug in API keys for Claude 3.7 or GPT-4o. Keys encrypted via OS Keyring.'
      }
    },
    security: {
      badge: 'Rust-Enforced Threat Modeling',
      title: 'Security Is an Architectural Invariant',
      subtitle:
        'Many AI apps pass arbitrary prompts to system shells. Hubbub is fundamentally different: the LLM is never granted authority over your computer.',
      interactiveTitle: 'Interactive Architecture Pipeline',
      interactiveHint: 'Click any layer to inspect',
      layers: {
        ui: { num: 'LAYER 01', name: 'Desktop UI', desc: 'React 19 + Tauri 2 IPC' },
        core: { num: 'LAYER 02', name: 'Rust Core', desc: 'Agent Loop & Tokio' },
        policy: { num: 'LAYER 03 • SECURITY GATE', name: 'Policy Engine', desc: 'Capability Tokens & Auth' },
        tools: { num: 'LAYER 04', name: 'Tool Gateway', desc: 'PathGuard & UrlGuard' },
        storage: { num: 'LAYER 05', name: 'Local Vault', desc: 'SQLite FTS5 + Workspace' }
      },
      rules: {
        rule1: { num: 'RULE #1', title: 'No LLM Security Authority', desc: 'Every system permission check is executed in native Rust compiled code.' },
        rule2: { num: 'RULE #2', title: 'No Direct OS Shell Access', desc: 'Agents operate exclusively through bounded, verified tool gateways.' },
        rule3: { num: 'RULE #3', title: 'Markdown as First-Class Data', desc: 'Research synthesis is treated as persistent living documents.' },
        rule4: { num: 'RULE #4', title: 'Complete Traceability', desc: 'Every action maps to a verifiable Run, Step, and Trace record.' }
      }
    },
    compare: {
      badge: 'Honest Evaluation',
      title: 'How Hubbub Chat Compares',
      subtitle:
        'Designed from the ground up for researchers, deep learners, and builders who refuse to compromise on privacy, performance, or multi-agent autonomy.',
      colFeature: 'Capability / Architecture',
      colHubbub: 'Hubbub Chat',
      colWeb: 'Cloud Web Chatbots',
      colElectron: 'Electron AI Wrappers',
      rows: [
        {
          feature: 'License & Freedom',
          hubbub: 'Apache License 2.0 (Permissive Open Source)',
          webChat: 'Proprietary Cloud SaaS (Closed source)',
          electron: 'Proprietary or restrictive telemetry'
        },
        {
          feature: 'Data Sovereignty & Local Storage',
          hubbub: '100% Local (SQLite FTS5 & Markdown files)',
          webChat: 'Closed cloud servers (Zero local ownership)',
          electron: 'Fragmented cache / Remote cloud sync'
        },
        {
          feature: 'Multi-Agent Coordinated Runtime',
          hubbub: 'Deterministic DAG (Supervisor ➔ 3 Specialists)',
          webChat: 'Single linear chat thread',
          electron: 'Single model prompt or simple tool calls'
        },
        {
          feature: 'System Security Boundaries',
          hubbub: 'Rust Policy Engine (PathGuard & UrlGuard)',
          webChat: 'No local OS access at all',
          electron: 'Broad Node.js permissions or shell access'
        },
        {
          feature: 'RAM & Resource Footprint',
          hubbub: '< 30 MB Baseline (Tauri 2 + Rust)',
          webChat: '300 MB+ (Heavy browser tab)',
          electron: '500 MB – 1.2 GB (Chromium runtime)'
        },
        {
          feature: 'Offline Operation & Local Models',
          hubbub: 'Native Ollama & llama.cpp (100% offline)',
          webChat: 'Requires active cloud internet',
          electron: 'Often requires cloud login & telemetry'
        },
        {
          feature: 'Document Synthesis & Reports',
          hubbub: 'Integrated Milkdown WYSIWYG Editor',
          webChat: 'Ephemeral copy-paste chat bubbles',
          electron: 'Generic raw text files'
        },
        {
          feature: 'Observability & Token Budgeting',
          hubbub: 'Deterministic Run/Step/Trace with hard limits',
          webChat: 'Opaque cloud streaming',
          electron: 'Variable recursive prompt burns'
        }
      ]
    },
    download: {
      badge: 'Apache License 2.0',
      title: 'Download Hubbub Chat',
      subtitle:
        'Free & Open Source under the Apache License 2.0. Install Hubbub Chat on your Windows PC and experience true multi-agent intelligence with zero cloud telemetry.',
      cardTitle: 'Hubbub Chat for Windows',
      cardSub: 'Supports Windows 10 & 11 (64-bit Architecture)',
      msiBtn: 'Download Installer (.msi)',
      msiSub: 'Recommended for Windows 10/11',
      zipBtn: 'Download Portable Edition (.zip)',
      zipSub: 'Standalone Executable',
      shaLabel: 'SHA-256 Release Checksum',
      copied: 'Copied!',
      copy: 'Copy',
      sysReqTitle: 'System Requirements & License',
      osReq: 'OS: Windows 10 (1903+) or 11',
      osSub: 'WebView2 runtime pre-installed',
      ramReq: 'RAM: 4 GB Minimum',
      ramSub: 'Hubbub baseline uses < 30 MB',
      ollamaReq: 'Optional: Ollama for Local AI',
      ollamaSub: 'Zero cloud API costs when run locally',
      licenseReq: 'License: Apache License 2.0',
      licenseSub: 'Permissive open source, free for personal and commercial use',
      macLinux: 'macOS & Linux',
      roadmapTag: 'Phase 2 Roadmap',
      steps: {
        step1Title: 'Install Hubbub Chat',
        step1Desc: 'Run the native Windows installer in under 10 seconds without heavy dependencies.',
        step2Title: 'Connect Your LLMs',
        step2Desc: 'Auto-detect your local Ollama models with one click, or enter your personal API keys.',
        step3Title: 'Start Deep Research',
        step3Desc: 'Assign tasks to your agent team, let them audit sources and craft living Markdown reports.'
      }
    },
    faq: {
      badge: 'Got Questions?',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about Hubbub Chat, its Apache 2.0 license, and multi-agent architecture.',
      items: [
        {
          q: 'What is the license of Hubbub Chat? Can I inspect the source code?',
          a: 'Hubbub Chat is released as open source software under the permissive Apache License 2.0. You are free to inspect, audit, modify, fork, and distribute the code for both personal and commercial use with zero restrictions.'
        },
        {
          q: 'Is my data truly private? Does Hubbub Chat send telemetry to cloud servers?',
          a: 'Yes, Hubbub Chat is 100% local-first by architectural invariant. All conversations, tool executions, agent traces, and Markdown reports are stored directly on your computer inside a local SQLite database and workspace directory. We do not collect product telemetry, user analytics, or chat payloads.'
        },
        {
          q: 'Do I need a high-end dedicated GPU to use Hubbub Chat?',
          a: 'No. You can run Hubbub Chat in two flexible modes: (1) 100% offline using quantized local models through Ollama or llama.cpp, or (2) BYOK connecting to cloud frontier models like Claude 3.7 or GPT-4o. The desktop app itself uses under 30MB of RAM.'
        },
        {
          q: 'How is Hubbub Chat different from generic web chatbots or Electron AI apps?',
          a: 'Generic web chatbots offer a single chat bubble without local file access or multi-agent delegation. Electron apps consume 500MB+ to idle. Hubbub Chat is built natively with Tauri 2 and Rust, coordinates 4 specialized agents, protects your system with a capability-based Policy Engine, and integrates a living Milkdown WYSIWYG workspace.'
        },
        {
          q: 'How does the Rust Policy Engine protect my computer from rogue agents?',
          a: 'In Hubbub, the LLM is never treated as a security authority. Every system interaction passes through the Rust Tool Gateway: PathGuard prevents directory traversal attacks, UrlGuard blocks internal subnet scanning (SSRF protection), and high-impact actions require explicit user approval.'
        },
        {
          q: 'What are the 4 built-in agents and how do they work together?',
          a: 'Hubbub features: (1) Orchestrator (Supervisor) — plans tasks and enforces step budgets; (2) Researcher — searches the web and pulls scholarly preprints with UrlGuard; (3) Librarian — indexes and queries your local filesystem via SQLite FTS5; and (4) Tutor — synthesizes findings into structured Markdown reports with citations.'
        }
      ]
    },
    footer: {
      brandName: 'Hubbub Chat',
      shortName: 'Hubbub',
      tagline: 'Personal Multi-Agent AI Studio for deep research and sovereign learning.',
      zeroTelemetry: 'Apache License 2.0 • Zero cloud telemetry • 100% Local-First',
      licenseInfo: 'Licensed under the Apache License, Version 2.0.',
      colProduct: 'Product',
      colSecurity: 'Security',
      colEcosystem: 'Ecosystem',
      copyright: 'Hubbub Chat contributors. Open source under Apache-2.0.',
      builtWith: 'Built with Rust, Tauri 2 & React 19',
      privacyFirst: 'Apache License 2.0 Open Source'
    }
  },
  vi: {
    nav: {
      brandName: 'Hubbub Chat',
      shortName: 'Hubbub',
      versionBadge: 'v0.1.0',
      licenseBadge: 'Apache 2.0',
      subtitle: 'Không Gian AI Đa Tác Tử',
      agents: 'Đội Ngũ Agent',
      features: 'Tính Năng',
      security: 'Bảo Mật Rust',
      architecture: 'Kiến Trúc',
      compare: 'So Sánh',
      faq: 'Hỏi Đáp',
      download: 'Tải cho Windows',
      starOnGithub: 'Star trên GitHub'
    },
    hero: {
      pillTag: 'Hubbub Chat v0.1.0 Chính Thức Phát Hành',
      pillDesc: 'Mã Nguồn Mở Apache 2.0 • Lõi Rust Bản Địa',
      title1: 'Không Gian Chat ',
      titleHighlight: 'AI Đa Tác Tử Cá Nhân',
      title2: ' Cho Nghiên Cứu Sâu.',
      subtitle:
        'Ứng dụng Desktop cá nhân hoá xây dựng trên lõi Rust nguyên bản. Điều phối đội ngũ Agent tự chủ, truy xuất web và tài liệu máy tính với Policy Engine nghiêm ngặt, tạo báo cáo Markdown sống động — miễn phí và mở theo giấy phép Apache License 2.0.',
      ctaDownload: 'Tải Hubbub Chat Cho Windows',
      ctaDownloadSub: 'v0.1.0 • 64-bit • Mã nguồn mở Apache 2.0',
      ctaDemo: 'Trải Nghiệm Điều Phối',
      ctaGithub: 'Mã Nguồn GitHub',
      quote: '"Xây dựng bằng Rust. Dữ liệu không bao giờ rời khỏi máy của bạn nếu chưa có sự cho phép."',
      metrics: {
        local: {
          title: '100% Cục Bộ (Local-First)',
          desc: 'Không gửi dữ liệu telemetry'
        },
        security: {
          title: 'Rust Policy Engine',
          desc: 'Kiểm duyệt PathGuard & UrlGuard'
        },
        ram: {
          title: '< 30MB RAM',
          desc: 'Tốc độ bản địa với Tauri 2'
        },
        license: {
          title: 'Apache License 2.0',
          desc: 'Giấy phép mã nguồn mở tự do'
        }
      },
      mockup: {
        windowTitle: 'Hubbub Chat v0.1.0 — Desktop AI Studio',
        workspaceTitle: 'Không gian: Nghiên Cứu / Mô Hình Suy Luận Nhỏ (SLM)',
        tabChat: 'Hội Thoại Agent',
        tabReport: 'Báo Cáo Milkdown',
        agentTeamTitle: 'Agent Hoạt Động',
        agentReady: '4 Sẵn sàng',
        vaultPath: 'Đường Dẫn Vault Cục Bộ',
        policyActive: 'Rust Policy Engine: Đang Giám Sát',
        userRole: 'Bạn (Trưởng Nhóm Nghiên Cứu)',
        userPrompt:
          'Hãy so sánh các kiến trúc suy luận cỡ 3B (như DeepSeek-R1-Distill, Qwen2.5-Math). Đối chiếu số liệu đo lường trong thư mục của tôi và trích dẫn bài báo mới nhất.',
        orchestratorPlan:
          'Phân bổ tác vụ đồng thời: Researcher quét bài báo arXiv, Librarian đọc file điểm chuẩn cục bộ.',
        urlApproved: 'UrlGuard: arxiv.org (Đã duyệt)',
        pathApproved: 'PathGuard: /benchmarks.json (Đã duyệt)',
        tutorArtifact: 'Đã tạo tài liệu Milkdown',
        openInEditor: 'Mở trong trình soạn thảo →',
        tutorSummary:
          'Điểm cốt lõi: DeepSeek-R1-Distill-Qwen-1.5B vượt mốc 82.3% trên GSM8K và chạy mượt mà tại máy với dưới 2.1GB VRAM.',
        inputPlaceholder: 'Giao việc cho đội Agent hoặc gõ lệnh /search, /read, /synthesize...'
      }
    },
    agents: {
      badge: 'Cơ Chế Điều Phối Đa Tác Tử',
      title: 'Đội Ngũ Agent Phối Hợp. Không Hỗn Loạn.',
      subtitle:
        'Ở Hubbub Chat, Agent không chạy theo các vòng lặp bất định vô tận. Một Orchestrator trung tâm sẽ lập kế hoạch, phân bổ cho các chuyên gia và kiểm duyệt mọi lệnh qua cổng Rust.',
      orchestrator: {
        role: 'Supervisor',
        name: 'Orchestrator',
        tagline: 'Phân rã mục tiêu & Điều phối chu trình',
        desc: 'Chia nhỏ yêu cầu phức tạp thành đồ thị thực thi DAG rõ ràng. Quản lý ngân sách bước (step budget) và cơ chế xử lý lỗi.',
        meta: 'Giới hạn bước xác định'
      },
      researcher: {
        role: 'Web & arXiv',
        name: 'Researcher',
        tagline: 'Tìm kiếm & Bằng chứng bên ngoài',
        desc: 'Tra cứu web công khai, đọc báo cáo khoa học và tài liệu trực tuyến. Mọi truy vấn HTTP đều được lọc qua UrlGuard.',
        meta: 'Bảo vệ bởi UrlGuard'
      },
      librarian: {
        role: 'Local Vault',
        name: 'Librarian',
        tagline: 'Quản thư & SQLite FTS5',
        desc: 'Đọc và lập chỉ mục thư mục tài liệu máy tính, hỗ trợ tìm kiếm toàn văn FTS5 dưới 2ms, đóng gói trong sandbox PathGuard.',
        meta: 'Sandbox hóa bởi PathGuard'
      },
      tutor: {
        role: 'Tổng Hợp Tri Thức',
        name: 'Tutor',
        tagline: 'Phương pháp Socratic & Soạn thảo',
        desc: 'Chuyển hóa dữ liệu thu thập thành các bài viết học thuật chuẩn Markdown trong Milkdown WYSIWYG, kèm đối chứng logic.',
        meta: 'Tạo tài liệu Milkdown'
      },
      simulation: {
        badge: 'Giả Lập Thực Thi Thời Gian Thực',
        title: 'Theo Dõi Từng Bước Thực Thi & Dấu Vết (Trace)',
        reset: 'Làm lại',
        simulatedGoal: 'Mục Tiêu Mô Phỏng',
        step: 'Bước',
        of: 'trên',
        back: 'Quay lại',
        next: 'Bước tiếp theo',
        guardEnforcement: 'Cổng Kiểm Duyệt Khả Năng Thực Thi (Rust Policy Guard)',
        gateBlocked: 'ĐÃ CHẶN CỔNG',
        verifiedSafe: 'KIỂM DUYỆT AN TOÀN',
        runtimeTrace: 'Nhật Ký Thực Thi (Sub-process trace stream)',
        resolution: 'Kết Quả & Đầu Ra Của Bước'
      }
    },
    bento: {
      badge: 'Thiết Kế Cho Công Việc Chuyên Sâu',
      title: 'Chế Tác Tỉ Mỉ Như Một Nhạc Cụ Cơ Khí',
      subtitle:
        'Từng thành phần của Hubbub Chat đều được tối ưu hóa cho tốc độ xử lý vượt trội, chủ quyền dữ liệu theo chuẩn giấy phép mở Apache 2.0.',
      card1: {
        badge: 'Bảo Mật Cốt Lõi',
        tag: 'Cột mốc Rust nghiêm ngặt',
        title: 'Policy Engine Dựa Trên Năng Quyền',
        desc: 'Mô hình AI không bao giờ được cấp quyền kiểm soát trực tiếp hệ thống. Mọi truy cập đĩa cứng hay mạng đều phải qua cơ chế Capability Tokens.',
        sub1Title: 'Cách Ly PathGuard',
        sub1Desc: 'Chuẩn hóa đường dẫn tập tin, ngăn chặn triệt để tấn công vượt thư mục (../), liên kết ảo và khu vực hệ thống nhạy cảm.',
        sub2Title: 'Lá Chắn UrlGuard & SSRF',
        sub2Desc: 'Chặn quét các dải IP nội bộ máy tính (127.0.0.1, 192.168.x.x), áp dụng danh sách tên miền an toàn.'
      },
      card2: {
        badge: 'Siêu Tinh Gọn',
        title: 'RAM Dưới 30MB',
        desc: 'Xây dựng trên Tauri 2 và Rust thay vì nhúng cả trình duyệt Chrome như Electron. Khởi động chưa đến 180ms, nhường toàn bộ tài nguyên cho mô hình AI.',
        hubbubLabel: 'Hubbub Chat (Tauri 2)',
        electronLabel: 'Ứng dụng Electron thông thường'
      },
      card3: {
        badge: 'Xưởng Tri Thức',
        title: 'Milkdown WYSIWYG',
        desc: 'Kiến thức không nên bị chôn vùi trong bong bóng chat trôi nổi. Báo cáo nghiên cứu được trình bày sống động trong trình soạn thảo trực quan với công thức toán và bảng biểu.',
        subTitle: 'Không Thất Thoát Ngữ Cảnh',
        subDesc: 'Đội ngũ Agent cùng hoàn thiện một tài liệu, dễ dàng đồng bộ vào Obsidian, VS Code hoặc xuất ra PDF.'
      },
      card4: {
        badge: 'Cam Kết Thực Thi',
        tag: 'Đồ thị DAG xác định',
        title: 'Chu Trình Run / Step / Trace',
        desc: 'Mỗi hành động của Agent đều nằm trong ngân sách bước hữu hạn. Người dùng có thể xem lại từng bước tư duy hoặc tạm dừng bất cứ khi nào.',
        sub1Title: 'Hạn Mức Bước',
        sub1Val: 'Giới hạn ngặt nghèo',
        sub1Desc: 'Không lo Agent lặp vô tận gây tốn token',
        sub2Title: 'Dấu Vết Đầy Đủ',
        sub2Val: 'Mọi câu lệnh & kết quả',
        sub2Desc: 'Lưu vết kiểm toán có thể xuất ra file',
        sub3Title: 'Phê Duyệt Người Dùng',
        sub3Val: 'Human-in-the-Loop',
        sub3Desc: 'Chủ động bấm cấp quyền các tác vụ'
      },
      card5: {
        badge: 'Trí Tuệ Cục Bộ',
        title: 'SQLite + FTS5',
        desc: 'Mọi lịch sử trao đổi, tài liệu và ghi chú đều lưu trong cơ sở dữ liệu SQLite tiêu chuẩn với bộ máy tìm kiếm toàn văn FTS5.',
        subTitle: 'Độ Trễ Dưới 5ms',
        subDesc: 'Tìm kiếm toàn bộ kho tri thức tức thì'
      },
      card6: {
        badge: 'Mã Nguồn Mở Tự Do',
        title: 'Mang Khóa Riêng, Chạy Ngoại Tuyến & Apache 2.0',
        desc: 'Phát hành miễn phí và mã nguồn mở theo giấy phép Apache License 2.0. Kết nối mô hình ngoại tuyến trên Ollama / llama.cpp để bảo mật 100%, hoặc nhập API key cá nhân cho Claude 3.7 hay GPT-4o. Mọi khóa đều mã hóa an toàn qua OS Keyring.'
      }
    },
    security: {
      badge: 'Mô Hình Đe Dọa Kiểm Soát Bằng Rust',
      title: 'Bảo Mật Là Bất Biến Kiến Trúc',
      subtitle:
        'Khác với các ứng dụng AI gọi lệnh terminal tùy tiện, Hubbub tuân thủ nguyên tắc: AI không bao giờ được nắm quyền can thiệp hệ điều hành.',
      interactiveTitle: 'Ống Dẫn Kiến Trúc 5 Tầng',
      interactiveHint: 'Nhấp vào từng tầng để xem chi tiết mã nguồn',
      layers: {
        ui: { num: 'TẦNG 01', name: 'Desktop UI', desc: 'React 19 + Tauri 2 IPC' },
        core: { num: 'TẦNG 02', name: 'Rust Core', desc: 'Vòng lặp Agent & Tokio' },
        policy: { num: 'TẦNG 03 • CỔNG AN NINH', name: 'Policy Engine', desc: 'Capability Tokens & Thẩm Quyền' },
        tools: { num: 'TẦNG 04', name: 'Tool Gateway', desc: 'Bộ lọc PathGuard & UrlGuard' },
        storage: { num: 'TẦNG 05', name: 'Local Vault', desc: 'SQLite FTS5 + Workspace' }
      },
      rules: {
        rule1: { num: 'NGUYÊN TẮC 1', title: 'LLM Không Có Quyền Bảo Mật', desc: 'Mọi quyền thực thi đều được Rust biên dịch kiểm tra nghiêm ngặt.' },
        rule2: { num: 'NGUYÊN TẮC 2', title: 'Không Cấp Shell Trực Tiếp', desc: 'Agent chỉ làm việc qua cổng Tool Gateway đã được đóng khung an toàn.' },
        rule3: { num: 'NGUYÊN TẮC 3', title: 'Markdown Là Dữ Liệu Loại 1', desc: 'Tài liệu nghiên cứu là tài sản lâu dài, không phải bong bóng chat tạm thời.' },
        rule4: { num: 'NGUYÊN TẮC 4', title: 'Dấu Vết Minh Bạch 100%', desc: 'Mỗi bước thực thi đều lưu vết với dấu thời gian chính xác tới mili-giây.' }
      }
    },
    compare: {
      badge: 'Đánh Giá Khách Quan',
      title: 'Vì Sao Hubbub Chat Khác Biệt',
      subtitle:
        'Được thiết kế cho giới nghiên cứu, kỹ sư và những ai ưu tiên quyền riêng tư, tốc độ và khả năng tự chủ của đội ngũ Agent.',
      colFeature: 'Năng Lực / Kiến Trúc',
      colHubbub: 'Hubbub Chat',
      colWeb: 'Chatbot Web Đám Mây',
      colElectron: 'Ứng Dụng Bọc Electron',
      rows: [
        {
          feature: 'Giấy Phép & Tự Do',
          hubbub: 'Apache License 2.0 (Mã nguồn mở tự do)',
          webChat: 'SaaS đám mây đóng (Không sở hữu mã nguồn)',
          electron: 'Phần mềm đóng hoặc thu thập telemetry'
        },
        {
          feature: 'Chủ Quyền Dữ Liệu & Lưu Trữ',
          hubbub: '100% Cục bộ (SQLite FTS5 & Markdown files)',
          webChat: 'Máy chủ đóng trên đám mây (Không làm chủ dữ liệu)',
          electron: 'Lưu bộ nhớ tạm / Phải đồng bộ đám mây'
        },
        {
          feature: 'Cơ Chế Phối Hợp Đa Agent',
          hubbub: 'Đồ thị DAG xác định (Supervisor ➔ 3 Chuyên gia)',
          webChat: 'Hội thoại tuyến tính 1 luồng',
          electron: 'Tự động hoàn thành code hoặc gọi 1 prompt'
        },
        {
          feature: 'Ranh Giới An Ninh Hệ Thống',
          hubbub: 'Rust Policy Engine (PathGuard & UrlGuard)',
          webChat: 'Không thể truy cập máy tính',
          electron: 'Quyền Node.js rộng hoặc chạy shell tùy ý'
        },
        {
          feature: 'Tiêu Thụ RAM & Tài Nguyên Máy',
          hubbub: '< 30 MB Baseline (Tauri 2 + Rust)',
          webChat: '300 MB+ (Tab trình duyệt nặng)',
          electron: '500 MB – 1.2 GB (Môi trường Chromium)'
        },
        {
          feature: 'Hoạt Động Ngoại Tuyến & Model Cục Bộ',
          hubbub: 'Hỗ trợ bản địa Ollama & llama.cpp (100% offline)',
          webChat: 'Bắt buộc kết nối Internet liên tục',
          electron: 'Thường bắt buộc đăng nhập tài khoản đám mây'
        },
        {
          feature: 'Không Gian Soạn Thảo Báo Cáo',
          hubbub: 'Trình soạn thảo WYSIWYG Milkdown tích hợp',
          webChat: 'Đoạn văn chat dạng copy-paste',
          electron: 'File mã nguồn thô sơ'
        },
        {
          feature: 'Kiểm Soát Ngân Sách Bước & Token',
          hubbub: 'Run/Step/Trace xác định với hạn mức rõ ràng',
          webChat: 'Hạn ngạch mập mờ trên mây',
          electron: 'Dễ rơi vào các chu trình ngốn token'
        }
      ]
    },
    download: {
      badge: 'Apache License 2.0',
      title: 'Tải Hubbub Chat Cho Máy Tính',
      subtitle:
        'Miễn phí & Mã nguồn mở theo giấy phép Apache 2.0. Cài đặt Hubbub Chat lên Windows và trải nghiệm sức mạnh của AI đa tác tử mà không lo rò rỉ dữ liệu.',
      cardTitle: 'Hubbub Chat cho Windows',
      cardSub: 'Hỗ trợ Windows 10 & 11 (Kiến trúc 64-bit)',
      msiBtn: 'Tải Bộ Cài Đặt (.msi)',
      msiSub: 'Khuyên dùng cho Windows 10/11',
      zipBtn: 'Tải Bản Portable (.zip)',
      zipSub: 'Chạy trực tiếp không cần cài',
      shaLabel: 'Mã băm kiểm tra tính toàn vẹn SHA-256',
      copied: 'Đã copy!',
      copy: 'Sao chép',
      sysReqTitle: 'Yêu Cầu Hệ Thống & Giấy Phép',
      osReq: 'Hệ điều hành: Windows 10 (1903+) hoặc Windows 11',
      osSub: 'Tích hợp sẵn WebView2 runtime',
      ramReq: 'RAM: Tối thiểu 4 GB',
      ramSub: 'Bản thân Hubbub Chat chỉ dùng dưới 30 MB RAM',
      ollamaReq: 'Tùy chọn: Ollama để chạy mô hình ngoại tuyến',
      ollamaSub: 'Không mất chi phí API khi chạy cục bộ',
      licenseReq: 'Giấy phép: Apache License 2.0',
      licenseSub: 'Mã nguồn mở tự do, dùng thoải mái cho cá nhân & doanh nghiệp',
      macLinux: 'macOS & Linux',
      roadmapTag: 'Lộ trình Giai đoạn 2',
      steps: {
        step1Title: 'Cài Đặt Hubbub Chat',
        step1Desc: 'Chạy bộ cài đặt Windows nhanh chóng trong 10 giây, không kéo theo các gói Chrome cồng kềnh.',
        step2Title: 'Kết Nối Mô Hình AI',
        step2Desc: 'Tự động nhận diện Ollama trên máy chỉ bằng 1 cú nhấp, hoặc dán khóa API cá nhân của bạn.',
        step3Title: 'Bắt Đầu Nghiên Cứu',
        step3Desc: 'Giao đề tài cho đội ngũ Agent, thẩm định tài liệu và cùng viết nên những báo cáo Markdown sống động.'
      }
    },
    faq: {
      badge: 'Thắc Mắc Phổ Biến',
      title: 'Câu Hỏi Thường Gặp',
      subtitle: 'Mọi thông tin về Hubbub Chat, giấy phép mở Apache 2.0 và đội ngũ Agent.',
      items: [
        {
          q: 'Hubbub Chat sử dụng giấy phép nào? Tôi có thể xem mã nguồn không?',
          a: 'Hubbub Chat được phát hành hoàn toàn dưới dạng mã nguồn mở theo giấy phép Apache License 2.0. Bạn hoàn toàn có quyền xem, kiểm tra, sửa đổi và sử dụng cho cả mục đích cá nhân lẫn thương mại mà không có bất kỳ ràng buộc nào.'
        },
        {
          q: 'Dữ liệu của tôi có thực sự riêng tư? Hubbub Chat có gửi dữ liệu lên đám mây không?',
          a: 'Có, Hubbub Chat cam kết 100% dữ liệu cục bộ theo nguyên tắc kiến trúc đóng băng. Toàn bộ hội thoại, nhật ký thực thi và báo cáo đều được lưu trữ trực tiếp trên máy tính của bạn trong SQLite và thư mục làm việc. Chúng tôi không thu thập dữ liệu hành vi, phân tích người dùng hay nội dung trò chuyện.'
        },
        {
          q: 'Tôi có cần một chiếc máy tính có card đồ họa (GPU) khủng để dùng Hubbub Chat không?',
          a: 'Không bắt buộc. Bạn có thể sử dụng linh hoạt theo 2 cách: (1) Chạy mô hình cục bộ qua Ollama / llama.cpp với các mô hình nhỏ như Llama-3.2-3B hay DeepSeek-R1-Distill-1.5B chạy mượt trên CPU thông thường, hoặc (2) Nhập API Key cá nhân để dùng Claude 3.7 Sonnet hay GPT-4o. Bản thân ứng dụng chỉ tiêu tốn dưới 30MB RAM.'
        },
        {
          q: 'Hubbub Chat khác gì so với ChatGPT web hay các app bọc Electron?',
          a: 'ChatGPT web chỉ là 1 luồng chat đóng, không có quyền truy cập file máy tính an toàn và dữ liệu nằm trên mây. Các app Electron thì ngốn 500MB đến 1GB RAM chỉ để chạy nền. Hubbub Chat được viết bằng Rust + Tauri 2 siêu nhẹ, điều phối 4 Agent chuyên biệt, bảo vệ máy tính bằng Rust Policy Engine và tích hợp trình soạn thảo Markdown WYSIWYG.'
        },
        {
          q: 'Rust Policy Engine bảo vệ máy tính của tôi khỏi Agent như thế nào?',
          a: 'Trong Hubbub, mô hình AI không bao giờ được coi là nơi ra quyết định an ninh. Mọi hành vi đều phải thông qua Tool Gateway viết bằng Rust: PathGuard ngăn chặn các nỗ lực đọc ghi file ngoài thư mục cho phép (chống Path Traversal), UrlGuard chặn quét mạng nội bộ (chống SSRF), và mọi tác vụ nhạy cảm đều cần người dùng xác nhận trực tiếp.'
        },
        {
          q: 'Bốn Agent có sẵn hoạt động cùng nhau như thế nào?',
          a: 'Bao gồm: (1) Orchestrator (Trưởng nhóm) — lập kế hoạch, giới hạn bước và phân công; (2) Researcher — tra cứu web và tải bài báo khoa học qua UrlGuard; (3) Librarian — tìm kiếm và lập chỉ mục kho file của bạn qua SQLite FTS5; và (4) Tutor — tổng hợp toàn bộ kết quả thành báo cáo Markdown hoàn chỉnh kèm trích dẫn.'
        }
      ]
    },
    footer: {
      brandName: 'Hubbub Chat',
      shortName: 'Hubbub',
      tagline: 'Không gian chat AI đa tác tử cá nhân cho học tập và nghiên cứu chuyên sâu.',
      zeroTelemetry: 'Apache License 2.0 • Không phân tích đám mây • 100% Cục bộ',
      licenseInfo: 'Phát hành theo giấy phép mã nguồn mở Apache License 2.0.',
      colProduct: 'Sản Phẩm',
      colSecurity: 'Bảo Mật',
      colEcosystem: 'Hệ Sinh Thái',
      copyright: 'Cộng đồng Hubbub Chat. Mã nguồn mở theo giấy phép Apache-2.0.',
      builtWith: 'Xây dựng với Rust, Tauri 2 & React 19',
      privacyFirst: 'Mã Nguồn Mở Apache 2.0'
    }
  }
}
