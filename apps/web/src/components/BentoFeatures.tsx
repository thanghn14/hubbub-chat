import React from 'react'
import {
  ShieldCheck,
  Zap,
  FileEdit,
  Activity,
  Database,
  KeyRound,
  Lock,
  Flame,
  CheckCircle2,
  Cpu,
  SearchCode
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'

export const BentoFeatures: React.FC = () => {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-indigo-500/05 dark:bg-violet-600/08 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-3.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{t('bento.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('bento.title')}
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed px-2">
            {t('bento.subtitle')}
          </p>
        </div>

        {/* Bento Grid (Optimized for Mobile, Tablet md:grid-cols-2, and Desktop lg:grid-cols-3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Rust Policy Engine */}
          <div className="md:col-span-2 lg:col-span-2 glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-violet-500/10 border border-indigo-200 dark:border-violet-500/25 flex items-center justify-center text-indigo-600 dark:text-violet-300 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400">{t('bento.card1.badge')}</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-violet-500/15 text-indigo-700 dark:text-violet-300 px-2 py-0.5 rounded font-mono border border-indigo-200 dark:border-violet-500/20">
                {t('bento.card1.tag')}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {t('bento.card1.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xl mb-6">
              {t('bento.card1.desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('bento.card1.sub1Title')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('bento.card1.sub1Desc')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('bento.card1.sub2Title')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('bento.card1.sub2Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Tauri 2 Native Speed */}
          <div className="col-span-1 glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-5">
              <Cpu className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('bento.card2.badge')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {t('bento.card2.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed mb-6">
              {t('bento.card2.desc')}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('bento.card2.hubbubLabel')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">~28 MB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-emerald-500 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">{t('bento.card2.electronLabel')}</span>
                <span className="text-rose-500 dark:text-rose-400">450 - 800 MB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-rose-400/80 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 3: Living Markdown Workspace */}
          <div className="col-span-1 glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
              <FileEdit className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('bento.card3.badge')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {t('bento.card3.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed mb-6">
              {t('bento.card3.desc')}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.06] text-xs space-y-1.5">
              <div className="text-slate-800 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('bento.card3.subTitle')}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                {t('bento.card3.subDesc')}
              </p>
            </div>
          </div>

          {/* Card 4: Run/Step/Trace Engine */}
          <div className="md:col-span-2 lg:col-span-2 glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mb-5">
              <Activity className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t('bento.card4.badge')}</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-200 dark:border-indigo-500/20">
                {t('bento.card4.tag')}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {t('bento.card4.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xl mb-6">
              {t('bento.card4.desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.05]">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">{t('bento.card4.sub1Title')}</div>
                <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">{t('bento.card4.sub1Val')}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t('bento.card4.sub1Desc')}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.05]">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">{t('bento.card4.sub2Title')}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">{t('bento.card4.sub2Val')}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t('bento.card4.sub2Desc')}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.05]">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">{t('bento.card4.sub3Title')}</div>
                <div className="text-indigo-600 dark:text-indigo-300 font-bold text-xs sm:text-sm">{t('bento.card4.sub3Val')}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t('bento.card4.sub3Desc')}</div>
              </div>
            </div>
          </div>

          {/* Card 5: SQLite FTS5 Instant Search */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
              <Database className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('bento.card5.badge')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {t('bento.card5.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed mb-6">
              {t('bento.card5.desc')}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080a10] border border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
              <SearchCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{t('bento.card5.subTitle')}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('bento.card5.subDesc')}</div>
              </div>
            </div>
          </div>

          {/* Card 6: BYOK & Model Sovereignty */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 glass-card glass-card-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-violet-500/10 border border-indigo-200 dark:border-violet-500/25 flex items-center justify-center text-indigo-600 dark:text-violet-300 mb-5">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400">{t('bento.card6.badge')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {t('bento.card6.title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xl mb-6">
              {t('bento.card6.desc')}
            </p>

            <div className="flex flex-wrap gap-2">
              {['Ollama (Offline)', 'llama.cpp', 'Claude 3.7 Sonnet', 'GPT-4o', 'DeepSeek-V3/R1', 'OpenRouter'].map((model) => (
                <span
                  key={model}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-indigo-600 dark:text-violet-400" />
                  <span>{model}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
