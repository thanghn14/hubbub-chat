import React, { useState } from 'react'
import {
  Download,
  Check,
  Copy,
  ShieldCheck,
  Monitor,
  Laptop,
  CheckCircle2,
  FolderArchive
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'

export const DownloadSection: React.FC = () => {
  const [copiedHash, setCopiedHash] = useState(false)
  const { t } = useLanguage()
  const sha256Checksum = 'e8b394d82f7169ac421fbc21e789bc4412e873918a2401f8931293290ae5107e'

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Checksum)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  return (
    <section id="download" className="py-20 sm:py-28 relative overflow-hidden border-t border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-violet-500/10 border border-indigo-200 dark:border-violet-500/20 text-indigo-700 dark:text-violet-300 text-xs font-semibold mb-3.5">
            <Download className="w-3.5 h-3.5" />
            <span>{t('download.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('download.title')}
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed px-2">
            {t('download.subtitle')}
          </p>
        </div>

        {/* Primary Download Card */}
        <div className="max-w-4xl mx-auto glass-card rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/[0.1] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-lg dark:shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Col: Download details & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-violet-600/15 border border-indigo-200 dark:border-violet-500/25 flex items-center justify-center text-indigo-600 dark:text-violet-300 shrink-0">
                  <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{t('download.cardTitle')}</h3>
                    <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-violet-500/15 text-indigo-700 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/25">
                      v0.1.0 Beta
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('download.cardSub')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="https://github.com/thanghn14/hubbub-chat/releases/download/v0.1.0/hubbub-chat_0.1.0_x64_en-US.msi"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 dark:hover:from-indigo-500 dark:hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between group border border-transparent dark:border-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">{t('download.msiBtn')}</div>
                      <div className="text-[10px] sm:text-[11px] text-indigo-100 dark:text-indigo-200/80 font-normal truncate">hubbub-chat_0.1.0_x64_en-US.msi</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-white bg-black/20 px-2.5 py-1 rounded shrink-0">~18.4 MB</span>
                </a>

                <a
                  href="https://github.com/thanghn14/hubbub-chat/releases/download/v0.1.0/hubbub-chat_0.1.0_x64.portable.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-5 sm:px-6 rounded-2xl bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.07] border border-slate-200 dark:border-white/[0.07] hover:border-indigo-400 dark:hover:border-violet-500/25 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderArchive className="w-4 h-4 text-indigo-600 dark:text-violet-400 shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate">{t('download.zipBtn')}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">hubbub-chat_0.1.0_x64.portable.zip</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">~22.1 MB</span>
                </a>

                <div className="pt-1 text-center">
                  <a
                    href="https://github.com/thanghn14/hubbub-chat/releases"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Xem tất cả bản phát hành trên GitHub Releases →</span>
                  </a>
                </div>
              </div>

              {/* SHA256 Checksum Verification */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t('download.shaLabel')}</span>
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-indigo-600 dark:text-violet-400 hover:text-indigo-500 dark:hover:text-violet-300 flex items-center gap-1 transition-colors shrink-0 ml-2 font-medium"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">{t('download.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t('download.copy')}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.05] font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {sha256Checksum}
                </div>
              </div>
            </div>

            {/* Right Col: System Requirements & Specs (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-[#080a10] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] space-y-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-white/[0.05]">
                {t('download.sysReqTitle')}
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{t('download.osReq')}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('download.osSub')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{t('download.ramReq')}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('download.ramSub')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{t('download.ollamaReq')}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('download.ollamaSub')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{t('download.licenseReq')}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('download.licenseSub')}</div>
                  </div>
                </div>
              </div>

              {/* Cross-platform notice */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Laptop className="w-4 h-4" />
                  <span>{t('download.macLinux')}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-white/[0.03] border border-slate-300 dark:border-white/[0.06] text-slate-700 dark:text-slate-300">
                  {t('download.roadmapTag')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Quick Start Guide */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] relative">
            <span className="text-3xl font-extrabold text-indigo-500/15 dark:text-violet-500/20 absolute top-4 right-5 font-mono">01</span>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400 mb-1">Bước 1</div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">{t('download.steps.step1Title')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('download.steps.step1Desc')}
            </p>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] relative">
            <span className="text-3xl font-extrabold text-indigo-500/15 dark:text-violet-500/20 absolute top-4 right-5 font-mono">02</span>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400 mb-1">Bước 2</div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">{t('download.steps.step2Title')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('download.steps.step2Desc')}
            </p>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/[0.06] relative">
            <span className="text-3xl font-extrabold text-indigo-500/15 dark:text-violet-500/20 absolute top-4 right-5 font-mono">03</span>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-violet-400 mb-1">Bước 3</div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5">{t('download.steps.step3Title')}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('download.steps.step3Desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
