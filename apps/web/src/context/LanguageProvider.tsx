import React, { useState } from 'react'
import { LanguageContext, Language } from './LanguageContext.tsx'
import { translations } from '../utils/translations.ts'

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('hubbub_lang') as Language
      if (saved === 'vi' || saved === 'en') return saved
    } catch {
      // fallback
    }
    return 'en' // Default to English per user requirement
  })

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    try {
      localStorage.setItem('hubbub_lang', newLang)
    } catch {
      // ignore
    }
  }

  const t = (key: string): any => {
    const keys = key.split('.')
    let current: any = translations[lang]
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return key
      }
    }
    return current
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
