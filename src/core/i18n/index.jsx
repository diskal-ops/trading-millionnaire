import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import fr from './fr.json'
import en from './en.json'
import pt from './pt.json'
import es from './es.json'
import de from './de.json'

const DICTS = { fr, en, pt, es, de }
export const LANGS = ['fr', 'en', 'pt', 'es', 'de']
const STORAGE_KEY = 'kijun.lang'

const I18nContext = createContext(null)

function detectInitial() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && DICTS[saved]) return saved
  const nav = (navigator.language || 'fr').slice(0, 2)
  return DICTS[nav] ? nav : 'fr'
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitial)

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
    setLangState(next)
  }, [])

  // t(key, vars?) — module dicts can be merged in later via registry
  const t = useCallback(
    (key, vars) => {
      let str = DICTS[lang]?.[key] ?? DICTS.fr?.[key] ?? key
      if (vars) for (const k of Object.keys(vars)) str = str.replaceAll(`{${k}}`, vars[k])
      return str
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
