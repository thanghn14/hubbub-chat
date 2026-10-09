import React, { useState, useEffect } from 'react'
import { Download, ShieldCheck, Menu, X, Globe, Sun, Moon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.tsx'
import { useTheme } from '../context/ThemeContext.tsx'
import { Logo } from './Logo.tsx'

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.07] shadow-lg dark:shadow-2xl dark:shadow-black/40'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <Logo className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform duration-300 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                Hubbub <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Chat</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                {t('nav.versionBadge')}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
              {t('nav.subtitle')}
            </span>
          </div>
        </a>

        {/* Desktop Navigation (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <a
            href="#agents"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('nav.agents')}
          </a>
          <a
            href="#features"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('nav.features')}
          </a>
          <a
            href="#security"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.security')}</span>
          </a>
          <a
            href="#compare"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('nav.compare')}
          </a>
          <a
            href="#faq"
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('nav.faq')}
          </a>
        </nav>

        {/* Action CTAs, Language & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-all"
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng (Light Mode)' : 'Chuyển sang Giao diện Tối (Dark Mode)'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] p-0.5 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setLang('vi')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs ${
                lang === 'vi'
                  ? 'bg-white dark:bg-indigo-600/30 text-indigo-700 dark:text-white shadow-sm font-bold border border-slate-200 dark:border-indigo-500/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Tiếng Việt"
            >
              VI
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs ${
                lang === 'en'
                  ? 'bg-white dark:bg-indigo-600/30 text-indigo-700 dark:text-white shadow-sm font-bold border border-slate-200 dark:border-indigo-500/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Download for Windows CTA */}
          <a
            href="#download"
            className="relative group px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md bg-indigo-600 hover:bg-indigo-500 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 dark:hover:from-indigo-500 dark:hover:to-violet-500 border border-transparent dark:border-white/10"
          >
            <span className="relative flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.download')}</span>
              <span className="sm:hidden">Tải App</span>
            </span>
          </a>

          {/* Hamburger Menu on Tablet & Mobile (< 1280px) */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Drawer Navigation (Tablet & Mobile) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 dark:bg-[#090b12]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/[0.08] px-5 sm:px-8 py-5 space-y-3.5 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.07]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Giao diện & Ngôn ngữ:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-white/[0.06] p-0.5 border border-slate-200 dark:border-white/[0.08]">
                <button
                  onClick={() => setLang('vi')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    lang === 'vi' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  VI
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <a
              href="#agents"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium"
            >
              {t('nav.agents')}
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium"
            >
              {t('nav.features')}
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium"
            >
              {t('nav.security')}
            </a>
            <a
              href="#compare"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium"
            >
              {t('nav.compare')}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium"
            >
              {t('nav.faq')}
            </a>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>{t('nav.download')}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
