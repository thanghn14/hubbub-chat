import React from 'react'
import { Check, X, Minus, Sparkles, MoveRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'

export const ComparisonTable: React.FC = () => {
  const { lang, t } = useLanguage()

  const comparisonData = (t('compare.rows') as any[]) || []

  return (
    <section id="compare" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-violet-500/10 border border-indigo-200 dark:border-violet-500/20 text-indigo-700 dark:text-violet-300 text-xs font-semibold mb-3.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('compare.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('compare.title')}
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed px-2">
            {t('compare.subtitle')}
          </p>

          {/* Mobile/Tablet scroll hint */}
          <div className="mt-4 lg:hidden flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{lang === 'vi' ? 'Vuốt ngang để xem toàn bộ bảng' : 'Swipe horizontally to view full table'}</span>
            <MoveRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#090b12]/90 overflow-hidden shadow-md dark:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 w-1/4">
                    {t('compare.colFeature')}
                  </th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-extrabold text-indigo-900 dark:text-violet-300 bg-indigo-50/80 dark:bg-violet-600/[0.08] border-x border-indigo-200 dark:border-violet-500/20 w-1/3">
                    <div className="flex items-center gap-2">
                      <span>{t('compare.colHubbub')}</span>
                      <span className="text-[10px] bg-indigo-600 text-white dark:bg-violet-500/20 dark:text-violet-200 px-2 py-0.5 rounded font-mono border border-transparent dark:border-violet-500/30">
                        v0.1.0
                      </span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/5">
                    {t('compare.colWeb')}
                  </th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/5">
                    {t('compare.colElectron')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs sm:text-sm">
                {Array.isArray(comparisonData) && comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.015] transition-colors">
                    {/* Feature name */}
                    <td className="p-4 sm:p-6 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {row.feature}
                    </td>

                    {/* Hubbub column */}
                    <td className="p-4 sm:p-6 bg-indigo-50/40 dark:bg-violet-600/[0.04] border-x border-indigo-100 dark:border-violet-500/15 font-medium text-indigo-950 dark:text-violet-200">
                      <div className="flex items-start gap-2 sm:gap-2.5">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="leading-snug">{row.hubbub}</span>
                      </div>
                    </td>

                    {/* Cloud Web column */}
                    <td className="p-4 sm:p-6 text-slate-500 dark:text-slate-400">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3 h-3" />
                        </div>
                        <span className="leading-snug">{row.webChat}</span>
                      </div>
                    </td>

                    {/* Electron Wrappers column */}
                    <td className="p-4 sm:p-6 text-slate-500 dark:text-slate-400">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Minus className="w-3 h-3" />
                        </div>
                        <span className="leading-snug">{row.electron}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
