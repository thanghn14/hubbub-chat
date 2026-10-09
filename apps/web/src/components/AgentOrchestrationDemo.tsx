import React, { useState } from 'react'
import {
  Bot,
  Search,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  FileCode,
  Zap,
  RotateCcw,
  Sparkles,
  TerminalSquare
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'

export const AgentOrchestrationDemo: React.FC = () => {
  const { lang, t } = useLanguage()

  const scenarios = [
    {
      id: 'academic',
      title: lang === 'vi' ? 'Tổng Hợp Nghiên Cứu ArXiv' : 'Academic Literature & Preprint Synthesis',
      description:
        lang === 'vi'
          ? 'Quy trình nghiên cứu tự chủ kết hợp bài báo trực tuyến và ghi chú riêng tư.'
          : 'Autonomous research pipeline combining online scholarly papers with private workspace notes.',
      userGoal:
        lang === 'vi'
          ? 'Nghiên cứu kiến trúc lai State-Space Mamba-2 so với Attention trên ngữ cảnh dài.'
          : 'Investigate Transformer state-space hybrid models (Mamba-2) vs. Attention mechanisms for long-context recall.',
      steps: [
        {
          stepNumber: 1,
          agent: 'Orchestrator',
          action:
            lang === 'vi'
              ? 'Lập đồ thị thực thi DAG đa tầng, ấn định ngân sách tối đa 6 bước.'
              : 'Formulates multi-stage execution DAG and checks token budget (Max Steps: 6).',
          policyGate: 'PolicyEngine::AuthorizeStepPlan (Approved)',
          logSnippet: '[Orchestrator] Spawned sub-task #1 -> Researcher(arXiv), sub-task #2 -> Librarian(vault)',
          resultSummary:
            lang === 'vi'
              ? 'Mục tiêu được chia nhỏ thành 2 tác vụ truy xuất song song và 1 bước tổng hợp.'
              : 'Goal decomposed into 2 parallel retrieval tasks and 1 final synthesis step.'
        },
        {
          stepNumber: 2,
          agent: 'Researcher',
          action:
            lang === 'vi'
              ? 'Truy vấn API arXiv và trích xuất cấu trúc thuật toán Mamba-2.'
              : 'Queries arXiv API and parses Mamba-2 architecture whitepaper.',
          policyGate: 'UrlGuard::EnforceDomainAllowlist("arxiv.org") -> OK',
          logSnippet: '[Researcher] Fetched 2405.21060v1.pdf. Extracted State Space Duality matrix formulas.',
          resultSummary:
            lang === 'vi'
              ? 'Trích xuất điểm khác biệt: Tốc độ huấn luyện nhanh gấp 8 lần nhờ nhân khối ma trận.'
              : 'Retrieved exact algorithmic differences: 8x faster training via block matrix multiplication.'
        },
        {
          stepNumber: 3,
          agent: 'Librarian',
          action:
            lang === 'vi'
              ? 'Quét thư mục máy tính để lấy kết quả đo lường độ trễ trên ngữ cảnh 32k tokens.'
              : 'Scans local research vault for internal benchmark numbers on 32k context.',
          policyGate: 'PathGuard::SandboxCheck("/vault/benchmarks_2026.csv") -> OK',
          logSnippet: '[Librarian] SQLite FTS5 query returned 4 local benchmark reports in 1.8ms.',
          resultSummary:
            lang === 'vi'
              ? 'Độ trễ phần cứng: 42ms so với 190ms của FlashAttention-2 ở 32k tokens.'
              : 'Hardware latency profile: 42ms vs 190ms for FlashAttention-2 at 32k tokens.'
        },
        {
          stepNumber: 4,
          agent: 'Tutor',
          action:
            lang === 'vi'
              ? 'Tạo tài liệu Markdown Milkdown hoàn chỉnh kèm công thức toán và bảng đối chiếu.'
              : 'Generates structured Milkdown WYSIWYG Markdown document with citations & tables.',
          policyGate: 'Workspace::WriteArtifact("Mamba2_vs_Attention.md") -> OK',
          logSnippet: '[Tutor] Synthesized report with 5 references, LaTeX math, and performance comparison table.',
          resultSummary:
            lang === 'vi'
              ? 'Tài liệu nghiên cứu đã được lưu vào thư mục làm việc với trích dẫn chuẩn xác.'
              : 'Living research document saved to local workspace with verified citations.'
        }
      ]
    },
    {
      id: 'security-audit',
      title: lang === 'vi' ? 'Kiểm Soát An Ninh & Chặn Rò Rỉ' : 'Zero-Leak Security & Threat Modeling',
      description:
        lang === 'vi'
          ? 'Kiểm duyệt nghiêm ngặt các yêu cầu gọi công cụ của Agent bằng năng quyền Rust.'
          : 'Validating untrusted agent tool requests against strict capability boundaries.',
      userGoal:
        lang === 'vi'
          ? 'Mô phỏng prompt độc hại cố tình vượt sandbox để đánh cắp SSH key của máy.'
          : 'Simulate an untrusted prompt trying to escape sandbox to read private SSH keys.',
      steps: [
        {
          stepNumber: 1,
          agent: 'Orchestrator',
          action:
            lang === 'vi'
              ? 'Tiếp nhận prompt chứa chuỗi tấn công Path Traversal lẩn tránh.'
              : 'Receives prompt containing obfuscated path traversal injection.',
          policyGate: 'PolicyEngine::SanitizePrompt (Flagged)',
          logSnippet: '[Orchestrator] Dispatching file read request to Librarian with bounded capability context.',
          resultSummary:
            lang === 'vi'
              ? 'Yêu cầu được cô lập vào không gian thực thi có kiểm soát an ninh.'
              : 'Request isolated into sandboxed execution context.'
        },
        {
          stepNumber: 2,
          agent: 'Librarian',
          action:
            lang === 'vi'
              ? 'Thử nghiệm phân giải đường dẫn: "../../.ssh/id_rsa".'
              : 'Attempts to resolve path: "../../.ssh/id_rsa" on behalf of prompt.',
          policyGate: 'PathGuard::DenyTraversal(Target outside root) -> 403 FORBIDDEN',
          logSnippet: '[Rust Security] VIOLATION BLOCKED: PathGuard caught unpermitted filesystem escape.',
          resultSummary:
            lang === 'vi'
              ? 'Chặn đứng lập tức ở tầng mã Rust bản địa. Không có dữ liệu nào bị đọc.'
              : 'Hard block enforced in native Rust. No file access or leakage occurred.'
        },
        {
          stepNumber: 3,
          agent: 'Orchestrator',
          action:
            lang === 'vi'
              ? 'Ghi nhận phản hồi chặn từ Policy Engine và ghi vết vào SQLite.'
              : 'Receives security rejection from Policy Engine and logs audit trail to SQLite.',
          policyGate: 'AuditLog::RecordIncident(Severity::High, PathTraversalAttempt)',
          logSnippet: '[AuditLog] Incident #899 saved with timestamp, model ID, and rejected path signature.',
          resultSummary:
            lang === 'vi'
              ? 'Toàn bộ vết sự cố được lưu trữ bảo mật trên máy phục vụ kiểm toán.'
              : 'Complete cryptographic audit trail preserved locally.'
        },
        {
          stepNumber: 4,
          agent: 'Tutor',
          action:
            lang === 'vi'
              ? 'Giải thích rõ ràng về vi phạm an ninh và thông báo cho người dùng.'
              : 'Explains the security violation to user with recommended remediation.',
          policyGate: 'PolicyEngine::FormatSafeUserFeedback -> OK',
          logSnippet: '[Tutor] Alert displayed in UI: "Access denied by Rust PathGuard. Action aborted safely."',
          resultSummary:
            lang === 'vi'
              ? 'Người dùng nhận cảnh báo rõ ràng mà không ảnh hưởng tới hệ điều hành.'
              : 'User alerted transparently with zero risk to host operating system.'
        }
      ]
    }
  ]

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)

  const selectedScenario = scenarios[selectedScenarioIndex]
  const activeStep = selectedScenario.steps[currentStepIndex]

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'Orchestrator':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/10',
          border: 'border-indigo-500/30 dark:border-indigo-500/25',
          text: 'text-indigo-600 dark:text-indigo-300',
          badge: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/25'
        }
      case 'Researcher':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-500/10',
          border: 'border-sky-500/30 dark:border-sky-500/25',
          text: 'text-sky-600 dark:text-sky-300',
          badge: 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/25'
        }
      case 'Librarian':
        return {
          bg: 'bg-violet-500/10 dark:bg-violet-500/10',
          border: 'border-violet-500/30 dark:border-violet-500/25',
          text: 'text-violet-600 dark:text-violet-300',
          badge: 'bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/25'
        }
      case 'Tutor':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/10',
          border: 'border-amber-500/30 dark:border-amber-500/25',
          text: 'text-amber-600 dark:text-amber-300',
          badge: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/25'
        }
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          text: 'text-slate-700 dark:text-slate-300',
          badge: 'bg-slate-100 text-slate-700'
        }
    }
  }

  const agentColor = getAgentColor(activeStep.agent)

  return (
    <section id="agents" className="py-20 sm:py-28 relative overflow-hidden border-t border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('agents.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('agents.title')}
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed px-2">
            {t('agents.subtitle')}
          </p>
        </div>

        {/* 4 Agent Archetype Cards (1 on mobile, 2 on tablet, 4 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-12 sm:mb-16">
          {/* Card 1: Orchestrator */}
          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mb-4 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('agents.orchestrator.name')}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/25">
                {t('agents.orchestrator.role')}
              </span>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300/80 mb-2.5 font-medium">{t('agents.orchestrator.tagline')}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('agents.orchestrator.desc')}
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] text-[11px] font-mono text-indigo-700 dark:text-indigo-300/80 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{t('agents.orchestrator.meta')}</span>
            </div>
          </div>

          {/* Card 2: Researcher */}
          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('agents.researcher.name')}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/25">
                {t('agents.researcher.role')}
              </span>
            </div>
            <p className="text-xs text-sky-700 dark:text-sky-300/80 mb-2.5 font-medium">{t('agents.researcher.tagline')}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('agents.researcher.desc')}
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] text-[11px] font-mono text-sky-700 dark:text-sky-300/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('agents.researcher.meta')}</span>
            </div>
          </div>

          {/* Card 3: Librarian */}
          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('agents.librarian.name')}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/25">
                {t('agents.librarian.role')}
              </span>
            </div>
            <p className="text-xs text-violet-700 dark:text-violet-300/80 mb-2.5 font-medium">{t('agents.librarian.tagline')}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('agents.librarian.desc')}
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] text-[11px] font-mono text-violet-700 dark:text-violet-300/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('agents.librarian.meta')}</span>
            </div>
          </div>

          {/* Card 4: Tutor */}
          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('agents.tutor.name')}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/25">
                {t('agents.tutor.role')}
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300/80 mb-2.5 font-medium">{t('agents.tutor.tagline')}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('agents.tutor.desc')}
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] text-[11px] font-mono text-amber-700 dark:text-amber-300/80 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>{t('agents.tutor.meta')}</span>
            </div>
          </div>
        </div>

        {/* Interactive Scenario Stepper Container (Tablet & Mobile Optimized) */}
        <div className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/[0.09] p-4 sm:p-8 bg-white/90 dark:bg-[#090c13]/85 shadow-lg dark:shadow-2xl">
          {/* Header & Scenario Selector Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/[0.06]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-2">
                <TerminalSquare className="w-4 h-4" />
                <span>{t('agents.simulation.badge')}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t('agents.simulation.title')}
              </h3>
            </div>

            {/* Scenario toggle pills */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Demo scenarios">
              {scenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioIndex(idx)
                    setCurrentStepIndex(0)
                  }}
                  aria-pressed={selectedScenarioIndex === idx}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    selectedScenarioIndex === idx
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  <span>{sc.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Display */}
          <div className="my-5 p-3.5 sm:p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/15 border border-indigo-200 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 mt-0.5 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                  {t('agents.simulation.simulatedGoal')}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                  "{selectedScenario.userGoal}"
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.06] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Reset simulation"
              aria-label="Reset simulation steps"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('agents.simulation.reset')}</span>
            </button>
          </div>

          {/* Stepper Timeline Navigation (2x2 on mobile, 4 in row on tablet & desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 sm:mb-8" role="tablist" aria-label="Execution steps">
            {selectedScenario.steps.map((st, idx) => {
              const isCurrent = idx === currentStepIndex
              const isPast = idx < currentStepIndex
              return (
                <button
                  key={st.stepNumber}
                  onClick={() => setCurrentStepIndex(idx)}
                  role="tab"
                  aria-selected={isCurrent}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-500/25'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('agents.simulation.step')} {st.stepNumber}
                    </span>
                    {isPast ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.agent}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{st.action}</div>
                </button>
              )
            })}
          </div>

          {/* Step Detail Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#07090e] p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${agentColor.bg} border ${agentColor.border} flex items-center justify-center ${agentColor.text} shrink-0`}>
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{activeStep.agent} Action</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${agentColor.badge}`}>
                      {t('agents.simulation.step')} {activeStep.stepNumber} {t('agents.simulation.of')} {selectedScenario.steps.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{activeStep.action}</p>
                </div>
              </div>

              {/* Next/Prev Navigation */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {t('agents.simulation.back')}
                </button>
                <button
                  disabled={currentStepIndex === selectedScenario.steps.length - 1}
                  onClick={() => setCurrentStepIndex((prev) => Math.min(selectedScenario.steps.length - 1, prev + 1))}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow-sm flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span>{t('agents.simulation.next')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Policy Enforcement Verification Pill */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/[0.06] flex flex-col xs:flex-row xs:items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                {activeStep.policyGate.includes('Deny') || activeStep.policyGate.includes('Flagged') ? (
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider truncate">
                    {t('agents.simulation.guardEnforcement')}
                  </span>
                  <code className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate block">
                    {activeStep.policyGate}
                  </code>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 self-start xs:self-center ${
                activeStep.policyGate.includes('Deny')
                  ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/25'
                  : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25'
              }`}>
                {activeStep.policyGate.includes('Deny') ? t('agents.simulation.gateBlocked') : t('agents.simulation.verifiedSafe')}
              </span>
            </div>

            {/* Raw Execution Log Snippet */}
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <TerminalSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('agents.simulation.runtimeTrace')}</span>
              </div>
              <div className="bg-slate-900 dark:bg-black/50 text-slate-100 rounded-xl p-3 sm:p-4 border border-slate-800 dark:border-white/[0.05] font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto">
                <code>{activeStep.logSnippet}</code>
              </div>
            </div>

            {/* Output Summary */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-indigo-950/15 border border-slate-200 dark:border-indigo-500/15 shadow-sm">
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                {t('agents.simulation.resolution')}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {activeStep.resultSummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
