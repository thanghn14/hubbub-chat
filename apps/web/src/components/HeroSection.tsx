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
  Zap,
  Database
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
  metrics: { model: string; params: string; score: string; vram: string }[]
}

export const HeroSection: React.FC = () => {
  const { lang, t } = useLanguage()
  const [selectedScenarioId, setSelectedScenarioId] = useState<'slm' | 'security' | 'mamba'>('slm')
  const [activeTab, setActiveTab] = useState<'chat' | 'doc'>('chat')

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
        { model: 'DeepSeek-R1-1.5B', params: '1.8B', score: '82.3%', vram: '1.9 GB' },
        { model: 'Qwen2.5-Math-1.5B', params: '1.5B', score: '79.8%', vram: '1.8 GB' },
        { model: 'Llama-3.2-3B', params: '3.2B', score: '68.5%', vram: '2.8 GB' }
      ]
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
      urlStatus: 'UrlGuard: Blocked all telemetry',
      pathStatus: 'PathGuard: Path Traversal attempts blocked (403)',
      docTitle: 'audits/workspace_security_posture.md',
      docSummary:
        lang === 'vi'
          ? '100% đường dẫn tập tin tuân thủ quy tắc sandbox của Rust. Không phát hiện rò rỉ SSH key hay dữ liệu nhạy cảm.'
          : '100% file operations confined to verified workspace sandbox. Zero private key exposure detected.',
      metrics: [
        { model: 'PathGuard Sandbox', params: 'Rust Native', score: '100% Blocked', vram: '0.2 MB' },
        { model: 'UrlGuard SSRF Blocker', params: 'Rust Native', score: '0 Leak', vram: '0.1 MB' },
        { model: 'Audit Log Engine', params: 'SQLite FTS5', score: '42 Traces', vram: '1.1 MB' }
      ]
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
        { model: 'Mamba-2 SSD', params: '2.7B', score: '42 ms (32k)', vram: '2.4 GB' },
        { model: 'FlashAttention-2', params: '3.0B', score: '178 ms (32k)', vram: '4.8 GB' },
        { model: 'Vanilla Transformer', params: '3.0B', score: '620 ms (32k)', vram: '7.9 GB' }
      ]
    }
  }

  const currentScenario = scenarios[selectedScenarioId]

  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[850px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/08 to-sky-400/08 dark:from-indigo-600/12 dark:via-violet-600/10 dark:to-sky-500/08 blur-[140px] rounded-full pointer-events-none -z-10 animate-soft-glow" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-tech-grid opacity-50 pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_65%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ASYMMETRIC SPLIT BANNER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          {/* LEFT COLUMN: HERO HEADLINE & ACTIONS (5-6 cols) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 text-left">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t('hero.pillTag')}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {t('hero.title1')}
              <span className="gradient-text-accent block sm:inline">
                {t('hero.titleHighlight')}
              </span>
              {t('hero.title2')}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300/90 font-normal leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <a
                href="#download"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 dark:hover:from-indigo-500 dark:hover:to-violet-500 text-white font-bold text-sm shadow-md hover:shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 border border-transparent dark:border-white/10 group"
              >
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-bold">{t('hero.ctaDownload')}</div>
                  <div className="text-[10px] text-indigo-100 dark:text-indigo-200/80 font-normal">Windows 10/11 • 64-bit</div>
                </div>
              </a>

              <a
                href="https://github.com/thanghn14/hubbub-chat"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-white/[0.08] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t('hero.ctaGithub')}</span>
              </a>
            </div>

            {/* Trust Metrics Pill Matrix */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">100% Local-First</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Zero Telemetry</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">&lt; 30MB RAM</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Tauri 2 Native</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">Rust Policy Gate</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">PathGuard & UrlGuard</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center gap-2.5">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">SQLite FTS5</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Sub-ms Local Search</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: THE LIVE HUBBUB CHAT STUDIO CANVAS (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 relative">
            {/* Outer halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-sky-400/10 rounded-3xl blur-xl opacity-60 dark:opacity-40 -z-10" />

            {/* Window Container */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/[0.09] bg-white/95 dark:bg-[#0b0d14]/95 shadow-xl dark:shadow-2xl dark:shadow-black/80 overflow-hidden">
              {/* Window Header */}
              <div className="bg-slate-100/90 dark:bg-[#0f121b] border-b border-slate-200 dark:border-white/[0.06] px-3.5 sm:px-4 py-2.5 flex items-center justify-between select-none">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <Logo className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Hubbub Chat
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                      v0.1.0
                    </span>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div role="tablist" aria-label="Canvas mode" className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/[0.04] p-0.5 rounded-lg text-xs">
                  <button
                    role="tab"
                    aria-selected={activeTab === 'chat'}
                    onClick={() => setActiveTab('chat')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      activeTab === 'chat'
                        ? 'bg-white dark:bg-indigo-600/40 text-indigo-700 dark:text-white shadow-sm font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'vi' ? 'Hội thoại Agent' : 'Agent Chat'}
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'doc'}
                    onClick={() => setActiveTab('doc')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      activeTab === 'doc'
                        ? 'bg-white dark:bg-indigo-600/40 text-indigo-700 dark:text-white shadow-sm font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'vi' ? 'Báo cáo Milkdown' : 'Milkdown Doc'}
                  </button>
                </div>
              </div>

              {/* Scenario Selector Ribbon */}
              <div className="bg-slate-50 dark:bg-[#07090f] border-b border-slate-200 dark:border-white/[0.06] px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                  {lang === 'vi' ? 'Kịch bản:' : 'Scenario:'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label="Scenario selector">
                  {(['slm', 'security', 'mamba'] as const).map((scKey) => {
                    const sc = scenarios[scKey]
                    const isSelected = selectedScenarioId === scKey
                    return (
                      <button
                        key={scKey}
                        onClick={() => setSelectedScenarioId(scKey)}
                        aria-pressed={isSelected}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-200/60 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {sc.title}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Chat Stream View */}
              {activeTab === 'chat' ? (
                <div className="p-4 sm:p-5 space-y-3.5 bg-white dark:bg-[#0b0e16] min-h-[380px]">
                  {/* User Turn */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-200 dark:border-indigo-500/25 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-sm p-3 max-w-lg text-xs leading-relaxed shadow-sm">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider mb-0.5">
                        Research Prompt
                      </div>
                      {currentScenario.prompt}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      U
                    </div>
                  </div>

                  {/* Orchestrator Turn */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-sm p-3.5 text-xs space-y-2 flex-1 max-w-lg">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Orchestrator</span>
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded">
                            DAG Plan #104
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Step 1 of 3</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {currentScenario.plan}
                      </p>

                      {/* Rust Capability Clearance Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{currentScenario.urlStatus}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{currentScenario.pathStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Turn / Artifact Generated */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-sm p-3.5 text-xs space-y-2 flex-1 max-w-lg">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-1.5">
                        <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <span>Tutor</span>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded">
                            Milkdown Document
                          </span>
                        </span>
                        <button
                          onClick={() => setActiveTab('doc')}
                          className="text-[11px] text-indigo-600 dark:text-indigo-300 hover:underline font-medium"
                        >
                          View Document →
                        </button>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {currentScenario.docSummary}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Milkdown Document Studio Preview */
                <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-[#07090e] min-h-[380px] font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate">
                        {currentScenario.docTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">WYSIWYG Markdown</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border-l-2 border-indigo-600 text-xs text-indigo-900 dark:text-indigo-200">
                    <strong>Executive Finding:</strong> {currentScenario.docSummary}
                  </div>

                  {/* Metrics Table */}
                  <div className="overflow-x-auto -mx-1 sm:mx-0">
                    <table className="w-full text-left text-xs border border-slate-200 dark:border-white/[0.08] rounded-lg min-w-[340px]">
                      <thead className="bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-white/[0.06]">
                        <tr>
                          <th className="p-1.5 font-semibold">Model</th>
                          <th className="p-1.5 font-semibold">Params</th>
                          <th className="p-1.5 font-semibold">Score</th>
                          <th className="p-1.5 font-semibold">VRAM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono text-[11px]">
                        {currentScenario.metrics.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                            <td className="p-1.5 font-medium text-slate-900 dark:text-white">{row.model}</td>
                            <td className="p-1.5 text-slate-500 dark:text-slate-400">{row.params}</td>
                            <td className="p-1.5 text-indigo-600 dark:text-indigo-400 font-bold">{row.score}</td>
                            <td className="p-1.5 text-slate-600 dark:text-slate-300">{row.vram}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Stored at: <code className="font-mono text-slate-700 dark:text-slate-300">/vault/workspace/</code></span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">Export to Obsidian</span>
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="bg-slate-100/90 dark:bg-[#0f121b] border-t border-slate-200 dark:border-white/[0.06] p-2.5 sm:p-3 flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span className="truncate">{t('hero.mockup.inputPlaceholder')}</span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 hidden sm:inline">
                    Enter
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={lang === 'vi' ? 'Gửi lệnh nghiên cứu mẫu' : 'Send research prompt'}
                  className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shrink-0 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
