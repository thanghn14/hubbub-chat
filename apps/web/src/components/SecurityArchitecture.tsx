import React, { useState } from 'react'
import {
  ShieldCheck,
  Code2,
  Lock,
  Layers,
  Database,
  Cpu
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'

export const SecurityArchitecture: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'ui' | 'core' | 'policy' | 'tools' | 'storage'>('policy')
  const { lang, t } = useLanguage()

  return (
    <section id="security" className="py-20 sm:py-28 relative overflow-hidden border-t border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('security.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('security.title')}
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed px-2">
            {t('security.subtitle')}
          </p>
        </div>

        {/* Architecture Pipeline Visualizer */}
        <div className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/[0.09] p-4 sm:p-8 bg-white/90 dark:bg-[#090b12]/90 mb-12 sm:mb-16 shadow-lg dark:shadow-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400 mb-5 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>{t('security.interactiveTitle')}</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] sm:text-[11px]">{t('security.interactiveHint')}</span>
          </div>

          {/* Interactive Layer Pipeline (Responsive for Mobile, Tablet md:grid-cols-5, Desktop lg:grid-cols-5) */}
          <div role="tablist" aria-label="Architecture layers" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {/* Layer 1: Desktop UI */}
            <button
              role="tab"
              aria-selected={activeLayer === 'ui'}
              onClick={() => setActiveLayer('ui')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeLayer === 'ui'
                  ? 'bg-indigo-50 dark:bg-violet-600/15 border-indigo-300 dark:border-violet-500/50 text-indigo-900 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-[10px] font-mono text-indigo-600 dark:text-violet-400 mb-0.5">{t('security.layers.ui.num')}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t('security.layers.ui.name')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('security.layers.ui.desc')}</div>
            </button>

            {/* Layer 2: Rust Core */}
            <button
              role="tab"
              aria-selected={activeLayer === 'core'}
              onClick={() => setActiveLayer('core')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeLayer === 'core'
                  ? 'bg-indigo-50 dark:bg-violet-600/15 border-indigo-300 dark:border-violet-500/50 text-indigo-900 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-[10px] font-mono text-indigo-600 dark:text-violet-400 mb-0.5">{t('security.layers.core.num')}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t('security.layers.core.name')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('security.layers.core.desc')}</div>
            </button>

            {/* Layer 3: Policy Engine */}
            <button
              role="tab"
              aria-selected={activeLayer === 'policy'}
              onClick={() => setActiveLayer('policy')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeLayer === 'policy'
                  ? 'bg-emerald-50 dark:bg-emerald-600/15 border-emerald-300 dark:border-emerald-500/50 text-emerald-950 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mb-0.5">{t('security.layers.policy.num')}</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">{t('security.layers.policy.name')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('security.layers.policy.desc')}</div>
            </button>

            {/* Layer 4: Tool Gateway */}
            <button
              role="tab"
              aria-selected={activeLayer === 'tools'}
              onClick={() => setActiveLayer('tools')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeLayer === 'tools'
                  ? 'bg-sky-50 dark:bg-sky-600/15 border-sky-300 dark:border-sky-500/50 text-sky-950 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mb-0.5">{t('security.layers.tools.num')}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t('security.layers.tools.name')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('security.layers.tools.desc')}</div>
            </button>

            {/* Layer 5: Local Storage */}
            <button
              role="tab"
              aria-selected={activeLayer === 'storage'}
              onClick={() => setActiveLayer('storage')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeLayer === 'storage'
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-300 dark:border-indigo-500/50 text-indigo-950 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mb-0.5">{t('security.layers.storage.num')}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t('security.layers.storage.name')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('security.layers.storage.desc')}</div>
            </button>
          </div>

          {/* Detailed Inspector for Selected Layer */}
          <div className="bg-slate-50/70 dark:bg-[#0b0e16] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/[0.07] p-4 sm:p-6 space-y-4 font-mono text-xs">
            {activeLayer === 'policy' && (
              <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">crates/policy — Capability Engine</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">#![forbid(unsafe_code)]</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'vi'
                    ? 'Policy Engine kiểm duyệt mọi ý định do LLM đề xuất. Trước khi bất kỳ công cụ nào chạy, nó xác minh năng quyền mật mã, đối chiếu quy tắc và yêu cầu người dùng xác nhận nếu là hành động rủi ro.'
                    : 'The Policy Engine intercepts every intent requested by LLMs. Before any tool runs, it verifies cryptographic capabilities, evaluates rule grants, and checks whether explicit human authorization is required.'}
                </p>
                <div className="bg-slate-900 dark:bg-black/50 p-3 sm:p-4 rounded-xl text-emerald-400 leading-relaxed overflow-x-auto text-[11px] sm:text-xs">
                  <code>
                    {`// Rust Policy Engine checks capability token before dispatching tool
pub async fn check_capability(
    &self,
    ctx: &ExecutionContext,
    action: &ToolAction,
) -> Result<AuthorizedToken, SecurityViolation> {
    if !self.granted_capabilities.contains(&action.required_capability()) {
        return Err(SecurityViolation::UnauthorizedAction(action.id()));
    }
    self.approval_manager.verify_user_confirmation(action).await
}`}
                  </code>
                </div>
              </div>
            )}

            {activeLayer === 'tools' && (
              <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="font-bold text-sky-700 dark:text-sky-400 text-xs sm:text-sm">crates/tools — PathGuard & UrlGuard</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">Zero Shell Access</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'vi'
                    ? 'Mọi tác vụ truy cập đĩa cứng đều phải chuẩn hóa đường dẫn qua PathGuard để chống vượt thư mục. Tác vụ web được đóng khung bởi UrlGuard, chặn quét mạng nội bộ (SSRF).'
                    : 'All filesystem operations pass through PathGuard canonicalization. Web scraping is sandboxed by UrlGuard, which blocks private subnet IP ranges and prevents SSRF attacks.'}
                </p>
                <div className="bg-slate-900 dark:bg-black/50 p-3 sm:p-4 rounded-xl text-sky-300 leading-relaxed overflow-x-auto text-[11px] sm:text-xs">
                  <code>
                    {`// PathGuard canonicalization prevents directory traversal escapes
let canonical = fs::canonicalize(&target_path)?;
if !canonical.starts_with(&workspace_root) {
    return Err(PathGuardError::DirectoryTraversalBlocked(target_path));
}`}
                  </code>
                </div>
              </div>
            )}

            {activeLayer === 'ui' && (
              <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
                    <span className="font-bold text-indigo-700 dark:text-violet-400 text-xs sm:text-sm">apps/desktop — React 19 & Tauri 2</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">Minimal Footprint</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'vi'
                    ? 'Giao diện React 19 tối giản kết nối với backend Rust qua hệ thống lệnh Tauri IPC có kiểm tra kiểu dữ liệu nghiêm ngặt. Không duy trì kết nối mạng ngầm nào ra bên ngoài.'
                    : 'The frontend is a lean React 19 interface communicating with the Rust backend solely over strictly typed Tauri IPC commands and event streams.'}
                </p>
              </div>
            )}

            {activeLayer === 'core' && (
              <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
                    <span className="font-bold text-indigo-700 dark:text-violet-400 text-xs sm:text-sm">crates/agent — Tokio Multi-Agent Loop</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">Bounded Execution DAG</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'vi'
                    ? 'Chu trình thực thi bất đồng bộ với Tokio runtime. Mỗi Agent con hoạt động trong một sợi thực thi biệt lập với giới hạn token, thời gian chờ và cơ chế ngắt an toàn.'
                    : 'Asynchronous agent loops powered by Tokio. Each sub-agent runs in an isolated execution fiber with explicit token budgets, timeout guarantees, and step cancellation hooks.'}
                </p>
              </div>
            )}

            {activeLayer === 'storage' && (
              <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm">crates/store & workspace — SQLite FTS5</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">Standard File Vault</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'vi'
                    ? 'Không có định dạng đóng. Mọi lịch sử và nhật ký lưu trong file SQLite tiêu chuẩn, còn tài liệu được lưu dưới dạng file Markdown thuần túy trên đĩa cứng.'
                    : 'Zero cloud lock-in. All chats and logs sit in a standard SQLite file, and living documents are saved as pure Markdown files on your disk.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4 Architectural Freeze Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] shadow-sm">
            <div className="text-indigo-600 dark:text-violet-400 text-[11px] font-mono font-bold mb-1.5">{t('security.rules.rule1.num')}</div>
            <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1">{t('security.rules.rule1.title')}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('security.rules.rule1.desc')}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] shadow-sm">
            <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold mb-1.5">{t('security.rules.rule2.num')}</div>
            <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1">{t('security.rules.rule2.title')}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('security.rules.rule2.desc')}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] shadow-sm">
            <div className="text-sky-600 dark:text-sky-400 text-[11px] font-mono font-bold mb-1.5">{t('security.rules.rule3.num')}</div>
            <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1">{t('security.rules.rule3.title')}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('security.rules.rule3.desc')}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] shadow-sm">
            <div className="text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold mb-1.5">{t('security.rules.rule4.num')}</div>
            <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1">{t('security.rules.rule4.title')}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('security.rules.rule4.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
