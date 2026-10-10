import React, { useState } from 'react'
import {
  Download,
  Terminal,
  ShieldCheck,
  Cpu,
  Bot,
  GraduationCap,
  FileText,
  ArrowRight,
  Database,
  Copy,
  Check,
  Sparkles,
  Workflow,
  Search,
  BookOpen,
  Lock,
  ExternalLink,
  Activity,
  CheckCircle2
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'
import { Logo } from './Logo.tsx'

interface AgentScenario {
  id: string
  title: string
  tag: string
  prompt: string
  plan: string
  urlStatus: string
  pathStatus: string
  docTitle: string
  docSummary: string
  metrics: { model: string; params: string; score: string; vram: string; speed: string; barPercent: number }[]
  graphNodes: {
    orchestrator: { status: string; task: string }
    researcher: { status: string; task: string; domain: string }
    librarian: { status: string; task: string; path: string }
    tutor: { status: string; task: string; output: string }
  }
}

export const HeroSection: React.FC = () => {
  const { lang, t } = useLanguage()
  const [selectedScenarioId, setSelectedScenarioId] = useState<'slm' | 'security' | 'mamba'>('slm')
  const [activeTab, setActiveTab] = useState<'chat' | 'graph' | 'doc'>('chat')
  const [copiedCli, setCopiedCli] = useState(false)
  const [selectedDagNode, setSelectedDagNode] = useState<'orchestrator' | 'researcher' | 'librarian' | 'tutor'>('orchestrator')

  const scenarios: Record<'slm' | 'security' | 'mamba', AgentScenario> = {
    slm: {
      id: 'slm',
      title: lang === 'vi' ? 'Mô hình SLM Suy Luận' : 'SLM Reasoning Benchmark',
      tag: 'Ollama + arXiv',
      prompt:
        lang === 'vi'
          ? 'So sánh các kiến trúc suy luận cỡ 3B (DeepSeek-R1-Distill, Qwen2.5-Math). Trích xuất điểm số benchmark từ máy và đối chiếu bài báo mới.'
          : 'Compare 3B reasoning models (DeepSeek-R1-Distill, Qwen2.5-Math). Extract local benchmark logs and verify against recent papers.',
      plan:
        lang === 'vi'
          ? 'Phân bổ tác vụ song song: Researcher quét bài báo arXiv, Librarian đọc file điểm chuẩn cục bộ, Tutor tổng hợp tài liệu Milkdown.'
          : 'Parallel dispatch: Researcher scans arXiv preprints, Librarian queries local FTS5 benchmarks, Tutor synthesizes Milkdown document.',
      urlStatus: 'UrlGuard: arxiv.org/abs/2410... (Approved)',
      pathStatus: 'PathGuard: /vault/benchmarks_2026.json (Approved)',
      docTitle: 'reports/slm_reasoning_benchmark_2026.md',
      docSummary:
        lang === 'vi'
          ? 'DeepSeek-R1-Distill-1.5B đạt 82.3% trên GSM8K, chạy mượt ngoại tuyến với VRAM chỉ 1.9GB.'
          : 'DeepSeek-R1-Distill-1.5B scores 82.3% on GSM8K, running locally with under 1.9GB VRAM footprint.',
      metrics: [
        { model: 'DeepSeek-R1-1.5B', params: '1.8B', score: '82.3%', vram: '1.9 GB', speed: '68 tok/s', barPercent: 82 },
        { model: 'Qwen2.5-Math-1.5B', params: '1.5B', score: '79.8%', vram: '1.8 GB', speed: '72 tok/s', barPercent: 80 },
        { model: 'Llama-3.2-3B', params: '3.2B', score: '68.5%', vram: '2.8 GB', speed: '54 tok/s', barPercent: 68 }
      ],
      graphNodes: {
        orchestrator: {
          status: 'Active (Step 1/3)',
          task: lang === 'vi' ? 'Lập đồ thị DAG & phân rã 2 truy vấn song song' : 'DAG formulation & parallel sub-task dispatch'
        },
        researcher: {
          status: 'Fetching arXiv',
          task: lang === 'vi' ? 'Quét whitepaper 2410.02884v1' : 'Parsing arXiv preprint 2410.02884v1',
          domain: 'arxiv.org'
        },
        librarian: {
          status: 'Querying FTS5',
          task: lang === 'vi' ? 'Đọc /vault/benchmarks_2026.json (0.4ms)' : 'Scanning local benchmarks_2026.json (0.4ms)',
          path: '/vault/benchmarks_2026.json'
        },
        tutor: {
          status: 'Synthesizing',
          task: lang === 'vi' ? 'Tổng hợp tài liệu so sánh Markdown' : 'Compiling Milkdown synthesis document',
          output: 'reports/slm_benchmark.md'
        }
      }
    },
    security: {
      id: 'security',
      title: lang === 'vi' ? 'Kiểm Toán File & PathGuard' : 'Local Code Audit & PathGuard',
      tag: 'Rust Sandbox',
      prompt:
        lang === 'vi'
          ? 'Quét các tập tin cấu hình mật mã trong dự án, đảm bảo không có đường dẫn vượt khỏi thư mục gốc /workspace.'
          : 'Audit cryptographic config files in workspace, ensuring no paths escape outside the /workspace root boundary.',
      plan:
        lang === 'vi'
          ? 'Khởi tạo luồng kiểm toán an ninh: Librarian kiểm tra cây thư mục, Policy Engine kiểm duyệt tính hợp lệ của từng canonical path.'
          : 'Initialize security audit: Librarian scans directory tree, Policy Engine validates canonical boundaries of every path.',
      urlStatus: 'UrlGuard: Blocked all outbound telemetry',
      pathStatus: 'PathGuard: Path Traversal attempts blocked (403)',
      docTitle: 'audits/workspace_security_posture.md',
      docSummary:
        lang === 'vi'
          ? '100% đường dẫn tập tin tuân thủ quy tắc sandbox của Rust. Không phát hiện rò rỉ SSH key hay dữ liệu nhạy cảm.'
          : '100% file operations confined to verified workspace sandbox. Zero private key exposure detected.',
      metrics: [
        { model: 'PathGuard Sandbox', params: 'Rust Native', score: '100% Blocked', vram: '0.2 MB', speed: '0.1 ms', barPercent: 100 },
        { model: 'UrlGuard SSRF Blocker', params: 'Rust Native', score: '0 Leaks', vram: '0.1 MB', speed: '0.05 ms', barPercent: 100 },
        { model: 'Audit Log Engine', params: 'SQLite FTS5', score: '42 Traces', vram: '1.1 MB', speed: '0.4 ms', barPercent: 95 }
      ],
      graphNodes: {
        orchestrator: {
          status: 'Policy Active',
          task: lang === 'vi' ? 'Kích hoạt hàng rào kiểm toán an ninh Rust' : 'Enforcing Rust Policy Gate audit loop'
        },
        researcher: {
          status: 'Disabled (Sandbox)',
          task: lang === 'vi' ? 'Ngắt kết nối mạng ngoài (0 telemetry)' : 'Zero external telemetry allowed',
          domain: 'Localhost only'
        },
        librarian: {
          status: 'Auditing Paths',
          task: lang === 'vi' ? 'Kiểm tra 1,420 tệp trong /workspace/' : 'Scanning 1,420 files inside /workspace/',
          path: '/workspace/safe_root'
        },
        tutor: {
          status: 'Writing Audit Log',
          task: lang === 'vi' ? 'Xuất báo cáo tuân thủ bảo mật' : 'Exporting security posture compliance report',
          output: 'audits/security_posture.md'
        }
      }
    },
    mamba: {
      id: 'mamba',
      title: lang === 'vi' ? 'Nghiên Cứu Mamba-2 Context' : 'Mamba-2 Long-Context Recall',
      tag: 'Synthesis',
      prompt:
        lang === 'vi'
          ? 'Phân tích cơ chế State Space Duality trong Mamba-2 và so sánh tốc độ với FlashAttention-2 trên ngữ cảnh 32k tokens.'
          : 'Analyze State Space Duality in Mamba-2 and benchmark execution speed against FlashAttention-2 on 32k token windows.',
      plan:
        lang === 'vi'
          ? 'Researcher trích xuất tài liệu toán học của Mamba-2; Librarian truy vấn lịch sử đo đạc phần cứng; Tutor biên soạn báo cáo LaTeX.'
          : 'Researcher extracts Mamba-2 math specs; Librarian queries local hardware runs; Tutor drafts LaTeX-ready report.',
      urlStatus: 'UrlGuard: arxiv.org/abs/2405.21060 (Approved)',
      pathStatus: 'PathGuard: /vault/context_recall_32k.csv (Approved)',
      docTitle: 'research/mamba2_vs_attention_duality.md',
      docSummary:
        lang === 'vi'
          ? 'Mamba-2 giảm độ phức tạp tính toán từ bậc 2 xuống tuyến tính, suy luận nhanh hơn 4.2 lần trên ngữ cảnh 32k.'
          : 'Mamba-2 achieves linear compute scaling, executing 4.2x faster than standard quadratic attention on 32k sequences.',
      metrics: [
        { model: 'Mamba-2 SSD', params: '2.7B', score: '42 ms (32k)', vram: '2.4 GB', speed: '94 tok/s', barPercent: 92 },
        { model: 'FlashAttention-2', params: '3.0B', score: '178 ms (32k)', vram: '4.8 GB', speed: '46 tok/s', barPercent: 62 },
        { model: 'Vanilla Attention', params: '3.0B', score: '620 ms (32k)', vram: '7.9 GB', speed: '18 tok/s', barPercent: 30 }
      ],
      graphNodes: {
        orchestrator: {
          status: 'Linear Dispatch',
          task: lang === 'vi' ? 'Điều phối phân tích công thức State Space' : 'Dispatching State Space formula extraction'
        },
        researcher: {
          status: 'arXiv Parsed',
          task: lang === 'vi' ? 'Trích xuất ma trận A và B từ 2405.21060' : 'Extracting SSD matrices A, B from 2405.21060',
          domain: 'arxiv.org'
        },
        librarian: {
          status: 'Hardware Benchmark',
          task: lang === 'vi' ? 'Truy vấn bảng đo GPU VRAM 32k' : 'Querying local hardware run GPU metrics',
          path: '/vault/hardware_benchmarks.csv'
        },
        tutor: {
          status: 'Drafting LaTeX',
          task: lang === 'vi' ? 'Tạo bảng đối sánh và công thức LaTeX' : 'Synthesizing LaTeX tables & Markdown artifact',
          output: 'research/mamba2_duality.md'
        }
      }
    }
  }

  const currentScenario = scenarios[selectedScenarioId]

  const handleCopyCli = () => {
    navigator.clipboard.writeText('winget install HubbubChat')
    setCopiedCli(true)
    setTimeout(() => setCopiedCli(false), 2200)
  }

  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-36 overflow-hidden">
      {/* Dynamic Multi-Stop Ambient Glow Backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] lg:w-[1200px] h-[450px] bg-gradient-to-tr from-indigo-600/12 via-violet-600/10 to-sky-400/10 dark:from-indigo-600/18 dark:via-violet-600/15 dark:to-sky-500/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-soft-glow" />

      {/* Cyber Grid with Elliptical Radial Mask */}
      <div className="absolute inset-0 bg-tech-grid opacity-60 dark:opacity-45 pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_15%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* TOP ZONE: HERO HEADLINE & COMMAND ACTION CLUSTER */}
        {/* ========================================================= */}
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-7">
          {/* Live Agent Collective Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.09] backdrop-blur-xl shadow-sm hover:border-indigo-500/40 transition-all">
            {/* Pulsing Beacon Dot */}
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-beacon absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 dark:bg-emerald-400"></span>
            </span>

            {/* Micro Avatar Cluster of 4 Agents */}
            <div className="flex items-center -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#090a0f]" title="Orchestrator">
                O
              </span>
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#090a0f]" title="Researcher">
                R
              </span>
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#090a0f]" title="Librarian">
                L
              </span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#090a0f]" title="Tutor">
                T
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {lang === 'vi' ? 'Lõi Rust v0.1.0 • 4 Tác Tử Sẵn Sàng' : 'Rust Native v0.1.0 • 4 Coordinated Agents'}
            </span>

            <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
              100% Local-First
            </span>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            {t('hero.title1')}
            <span className="gradient-text-accent block sm:inline">
              {t('hero.titleHighlight')}
            </span>
            {t('hero.title2')}
          </h1>

          {/* Punchy Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* High-Impact Actions Row: Download + 1-Click CLI + GitHub */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
            {/* Primary Download Button */}
            <a
              href="#download"
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 dark:hover:from-indigo-500 dark:hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 border border-transparent dark:border-white/10 group cursor-pointer"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold leading-tight">{t('hero.ctaDownload')}</div>
                <div className="text-[10px] text-indigo-100 dark:text-indigo-200/80 font-normal">Windows 10/11 • 64-bit</div>
              </div>
            </a>

            {/* Interactive 1-Click CLI Install Pill */}
            <button
              type="button"
              onClick={handleCopyCli}
              className="px-4 py-3.5 rounded-2xl bg-white/90 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-mono text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer group"
              title={lang === 'vi' ? 'Nhấn để sao chép lệnh winget' : 'Click to copy winget command'}
            >
              <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-700 dark:text-slate-300 select-all font-semibold">winget install HubbubChat</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                copiedCli
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
              }`}>
                {copiedCli ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>{lang === 'vi' ? 'Đã Chép!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{lang === 'vi' ? 'Chép' : 'Copy'}</span>
                  </>
                )}
              </span>
            </button>

            {/* GitHub Star Secondary Action */}
            <a
              href="https://github.com/thanghn14/hubbub-chat"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-2 shadow-sm hover:shadow"
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{t('hero.ctaGithub')}</span>
            </a>
          </div>

          {/* Micro-Trust Strip: 4 Glass Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Local-First • Zero Telemetry</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]">
              <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>&lt; 30MB RAM Footprint</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]">
              <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Rust PolicyGate (Path & Url)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]">
              <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>SQLite FTS5 Local Search</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTERPIECE: THE LIVING MULTI-AGENT COMMAND STUDIO CANVAS */}
        {/* ========================================================= */}
        <div className="mt-12 sm:mt-16 lg:mt-20 relative max-w-6xl mx-auto perspective-stage">
          {/* Outer Ambient Glow Gradient Halo */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/25 via-violet-500/20 to-sky-400/20 rounded-[28px] sm:rounded-[36px] blur-2xl opacity-60 dark:opacity-40 -z-10" />

          {/* ========================================================= */}
          {/* FLOATING SATELLITE 1: TOP-RIGHT RUST SECURITY CLEARANCE */}
          {/* ========================================================= */}
          <div className="hidden lg:flex absolute -top-7 -right-5 xl:-right-8 z-20 items-center gap-3 p-3.5 rounded-2xl glass-card border border-emerald-500/30 shadow-2xl dark:shadow-black/70 animate-subtle-float pointer-events-none select-none">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white">PolicyGate Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                PathGuard: 100% Sandboxed • 0 Leaks
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FLOATING SATELLITE 2: BOTTOM-LEFT TAURI 2 TELEMETRY HUD */}
          {/* ========================================================= */}
          <div className="hidden lg:flex absolute -bottom-7 -left-5 xl:-left-8 z-20 items-center gap-3 p-3.5 rounded-2xl glass-card border border-indigo-500/30 shadow-2xl dark:shadow-black/70 animate-subtle-float-delayed pointer-events-none select-none">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white">Tauri 2 Native Core</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  24.8 MB RAM
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Local Ollama • 68 tok/s • 0 Cloud Calls
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* STUDIO WINDOW CONTAINER */}
          {/* ========================================================= */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/[0.09] bg-white/95 dark:bg-[#0b0d14]/95 shadow-2xl dark:shadow-black/90 overflow-hidden backdrop-blur-2xl">
            {/* 1. Studio Window Chrome Header */}
            <div className="bg-slate-100/95 dark:bg-[#0f121b] border-b border-slate-200 dark:border-white/[0.07] px-3.5 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2.5 select-none">
              {/* Window Controls & App Identity */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
                </div>
                <div className="flex items-center gap-2 pl-1.5 border-l border-slate-300/80 dark:border-white/10">
                  <Logo className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    hubbub://studio
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LOCAL ENGINE ACTIVE
                  </span>
                </div>
              </div>

              {/* View Mode Toggle: 3 Modes (Agent Stream / Neural DAG Graph / Milkdown Doc) */}
              <div role="tablist" aria-label="Studio mode switch" className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/[0.05] p-1 rounded-xl text-xs">
                <button
                  role="tab"
                  aria-selected={activeTab === 'chat'}
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-indigo-600/50 text-indigo-700 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Hội Thoại Agent' : 'Agent Stream'}</span>
                </button>

                <button
                  role="tab"
                  aria-selected={activeTab === 'graph'}
                  onClick={() => setActiveTab('graph')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    activeTab === 'graph'
                      ? 'bg-white dark:bg-indigo-600/50 text-indigo-700 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{lang === 'vi' ? 'Đồ Thị DAG' : 'Neural DAG'}</span>
                </button>

                <button
                  role="tab"
                  aria-selected={activeTab === 'doc'}
                  onClick={() => setActiveTab('doc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    activeTab === 'doc'
                      ? 'bg-white dark:bg-indigo-600/50 text-indigo-700 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Báo Cáo Milkdown' : 'Milkdown Doc'}</span>
                </button>
              </div>
            </div>

            {/* 2. Scenario Mission Selector Ribbon */}
            <div className="bg-slate-50/90 dark:bg-[#07090f] border-b border-slate-200 dark:border-white/[0.06] px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {lang === 'vi' ? 'Nhiệm Vụ Mẫu:' : 'Research Mission:'}
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                  {currentScenario.tag}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label="Research Mission Selector">
                {(['slm', 'security', 'mamba'] as const).map((scKey) => {
                  const sc = scenarios[scKey]
                  const isSelected = selectedScenarioId === scKey
                  return (
                    <button
                      key={scKey}
                      onClick={() => setSelectedScenarioId(scKey)}
                      aria-pressed={isSelected}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-200/60 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {sc.title}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Studio Main Display Canvas Area */}
            {activeTab === 'chat' && (
              /* TAB 1: DUAL-PANE AGENT STREAM & LIVE METRICS */
              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[420px] bg-white dark:bg-[#0b0e16]">
                {/* Left Stream: Dialogue & Task Decomposition (7 cols) */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* User Turn */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-indigo-50/90 dark:bg-indigo-950/30 border border-indigo-200/90 dark:border-indigo-500/25 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-sm p-3.5 text-xs leading-relaxed shadow-sm max-w-xl">
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                        <span>Research Directive</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">local://prompt</span>
                      </div>
                      {currentScenario.prompt}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      U
                    </div>
                  </div>

                  {/* Orchestrator Turn */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-sm p-3.5 text-xs space-y-2.5 flex-1 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Orchestrator Hub</span>
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                            DAG Plan #104
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Step 1 of 3</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {currentScenario.plan}
                      </p>

                      {/* Rust Capability Clearance Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{currentScenario.urlStatus}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{currentScenario.pathStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Turn / Generated Artifact */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-sm p-3.5 text-xs space-y-2 flex-1 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
                        <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <span>Tutor Synthesizer</span>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono">
                            Milkdown Document
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('doc')}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                        >
                          {lang === 'vi' ? 'Xem Báo Cáo →' : 'View Document →'}
                        </button>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {currentScenario.docSummary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Pane: Live Benchmarks & Local Hardware Telemetry (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#0e111a] border border-slate-200/90 dark:border-white/[0.08] space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {lang === 'vi' ? 'Bảng Đối Sánh Điểm Chuẩn' : 'Live Benchmark Radar'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Offline Run
                      </span>
                    </div>

                    {/* Comparative Visual Bars */}
                    <div className="space-y-3">
                      {currentScenario.metrics.map((row, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{row.model}</span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.score}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                              style={{ width: `${row.barPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            <span>VRAM: {row.vram}</span>
                            <span>Speed: {row.speed}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footprint Highlights */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                      <div className="p-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.05]">
                        <div className="text-slate-400">Inference Core:</div>
                        <div className="font-bold text-slate-900 dark:text-white">Ollama / Native 1.5B</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.05]">
                        <div className="text-slate-400">Search Speed:</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">0.4ms (FTS5)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE NEURAL DAG GRAPH TOPOLOGY */}
            {activeTab === 'graph' && (
              <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-[#07090f] min-h-[420px] flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-indigo-500" />
                      <span>{lang === 'vi' ? 'Đồ Thị Phân Bổ Tác Vụ Đa Tác Tử (DAG Plan #104)' : 'Multi-Agent Execution DAG Topology (#104)'}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'vi' ? 'Mỗi nút đại diện cho một Agent hoạt động độc lập dưới sự kiểm duyệt của Rust Policy Gate.' : 'Each node represents an autonomous agent operating within strict Rust sandbox boundaries.'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">
                    DAG Active
                  </span>
                </div>

                {/* The Interactive Node Topology View */}
                <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative">
                  {/* Node 1: Orchestrator */}
                  <div
                    onClick={() => setSelectedDagNode('orchestrator')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedDagNode === 'orchestrator'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-[#0e111a] border-slate-200 dark:border-white/[0.07] hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Orchestrator</div>
                        <div className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400">Hub / Planner</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                      {currentScenario.graphNodes.orchestrator.task}
                    </div>
                  </div>

                  {/* Node 2 & 3: Researcher & Librarian (Parallel Split) */}
                  <div className="space-y-3 md:col-span-1">
                    {/* Researcher */}
                    <div
                      onClick={() => setSelectedDagNode('researcher')}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedDagNode === 'researcher'
                          ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                          : 'bg-white dark:bg-[#0e111a] border-slate-200 dark:border-white/[0.07] hover:border-sky-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Researcher</div>
                          <div className="text-[9px] font-mono text-sky-600 dark:text-sky-400">UrlGuard: OK</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                        {currentScenario.graphNodes.researcher.task}
                      </div>
                    </div>

                    {/* Librarian */}
                    <div
                      onClick={() => setSelectedDagNode('librarian')}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedDagNode === 'librarian'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-[#0e111a] border-slate-200 dark:border-white/[0.07] hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Librarian</div>
                          <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">PathGuard: Sandboxed</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                        {currentScenario.graphNodes.librarian.task}
                      </div>
                    </div>
                  </div>

                  {/* Node 4: Tutor Synthesizer */}
                  <div
                    onClick={() => setSelectedDagNode('tutor')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedDagNode === 'tutor'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white dark:bg-[#0e111a] border-slate-200 dark:border-white/[0.07] hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Tutor</div>
                        <div className="text-[9px] font-mono text-amber-600 dark:text-amber-400">Milkdown Synthesis</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                      {currentScenario.graphNodes.tutor.task}
                    </div>
                  </div>

                  {/* Output Node: Sovereign Vault */}
                  <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'vi' ? 'Kho Lưu Cục Bộ' : 'Local Vault'}</span>
                    </div>
                    <div className="text-[10px] font-mono opacity-90 truncate">
                      {currentScenario.docTitle}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {lang === 'vi' ? 'Đã lưu và đồng bộ với Obsidian' : 'Saved & Obsidian Ready'}
                    </div>
                  </div>
                </div>

                {/* Node Detail Bar */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#0b0e16] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[10px]">
                      {selectedDagNode} Inspection:
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {currentScenario.graphNodes[selectedDagNode].task}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('doc')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    {lang === 'vi' ? 'Xem Sản Phẩm Cuối →' : 'View Generated Artifact →'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: MILKDOWN DOCUMENT PREVIEW STUDIO */}
            {activeTab === 'doc' && (
              <div className="p-5 sm:p-6 space-y-4 bg-white dark:bg-[#07090e] min-h-[420px] font-sans">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                      {currentScenario.docTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">
                    WYSIWYG Markdown
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-600 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <strong>Executive Finding:</strong> {currentScenario.docSummary}
                </div>

                {/* Benchmark Metrics Table */}
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full text-left text-xs border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden min-w-[420px]">
                    <thead className="bg-slate-100 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-white/[0.06]">
                      <tr>
                        <th className="p-2.5 font-bold">Model</th>
                        <th className="p-2.5 font-bold">Params</th>
                        <th className="p-2.5 font-bold">GSM8K / Score</th>
                        <th className="p-2.5 font-bold">VRAM</th>
                        <th className="p-2.5 font-bold">Throughput</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono text-xs">
                      {currentScenario.metrics.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{row.model}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-400">{row.params}</td>
                          <td className="p-2.5 text-indigo-600 dark:text-indigo-400 font-bold">{row.score}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.vram}</td>
                          <td className="p-2.5 text-emerald-600 dark:text-emerald-400">{row.speed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-white/[0.06]">
                  <span>
                    {lang === 'vi' ? 'Đường dẫn vault:' : 'Vault location:'}{' '}
                    <code className="font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded">
                      /vault/research_workspace/
                    </code>
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <span>Export to Obsidian</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )}

            {/* 4. Interactive Bottom Command Deck & Quick Prompt Chips */}
            <div className="bg-slate-100/95 dark:bg-[#0f121b] border-t border-slate-200 dark:border-white/[0.06] p-3 sm:p-4 space-y-2.5">
              {/* Command Input Box */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shadow-inner">
                  <span className="truncate">{t('hero.mockup.inputPlaceholder')}</span>
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                      /search
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                      /synthesize
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={lang === 'vi' ? 'Thực thi lệnh nghiên cứu' : 'Execute research command'}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shrink-0 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  {lang === 'vi' ? 'Thử ngay:' : 'Quick Prompt:'}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedScenarioId('slm'); setActiveTab('chat') }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-all shrink-0 cursor-pointer"
                >
                  ⚡ {lang === 'vi' ? 'So sánh 3B SLMs' : 'Compare 3B SLMs'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedScenarioId('security'); setActiveTab('chat') }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-all shrink-0 cursor-pointer"
                >
                  🛡️ {lang === 'vi' ? 'Kiểm toán PathGuard' : 'Audit PathGuard'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedScenarioId('mamba'); setActiveTab('chat') }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-all shrink-0 cursor-pointer"
                >
                  📚 {lang === 'vi' ? 'Phân tích Mamba-2' : 'Analyze Mamba-2'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
