import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { SUPPORTED_LANGS, translations } from './translations'

const STORAGE_KEY = 'tubarao_lang'

const LanguageContext = createContext(null)

function readStoredLang() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED_LANGS.includes(s)) return s
  } catch {
    /* ignore */
  }
  return 'pt'
}

/**
 * Replace `{name}` placeholders in a string.
 */
function interpolate(str, vars) {
  if (!str || !vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : `{${k}}`
  )
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGS.includes(next)) return
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations.pt
      const fallback = translations.pt
      const raw = dict[key] ?? fallback[key] ?? key
      return interpolate(raw, vars)
    },
    [lang]
  )

  useEffect(() => {
    document.documentElement.lang =
      lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en'
  }, [lang])

  const value = useMemo(
    () => ({ lang, setLang, t, supportedLangs: SUPPORTED_LANGS }),
    [lang, setLang, t]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
