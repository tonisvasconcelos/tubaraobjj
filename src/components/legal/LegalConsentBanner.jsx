import { useEffect, useMemo, useState } from 'react'
import {
  getActiveLegalTerms,
  getOrCreateVisitorId,
  recordLegalAgreement,
} from '../../services/publicApi'
import { useLanguage } from '../../i18n/LanguageProvider'

const CONSENT_STORAGE_KEY = 'tubarao-legal-consent-v1'

export default function LegalConsentBanner() {
  const { t, lang } = useLanguage()
  const [terms, setTerms] = useState([])
  const [expandedKey, setExpandedKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [hidden, setHidden] = useState(true)

  const termSummary = useMemo(() => {
    const map = new Map()
    for (const term of terms) {
      map.set(term.term_key, term)
    }
    return map
  }, [terms])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const locale = lang === 'pt' ? 'pt-BR' : lang
      const active = await getActiveLegalTerms(locale)
      if (cancelled) return
      const fingerprint = JSON.stringify(
        (active || []).map((item) => ({ key: item.term_key, version: item.version }))
      )
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (saved === fingerprint && fingerprint !== '[]') {
        setHidden(true)
      } else {
        setTerms(Array.isArray(active) ? active : [])
        setHidden(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [lang])

  async function acceptAll() {
    if (!terms.length) {
      setHidden(true)
      return
    }
    setSaving(true)
    try {
      const visitorId = getOrCreateVisitorId()
      await recordLegalAgreement({
        visitorId,
        accepted: true,
        consentScope: 'website_navigation',
        locale: lang === 'pt' ? 'pt-BR' : lang,
        path: window.location.pathname,
        terms: terms.map((term) => ({
          termId: term.id,
          termKey: term.term_key,
          version: term.version,
          accepted: true,
        })),
      })
      const fingerprint = JSON.stringify(terms.map((item) => ({ key: item.term_key, version: item.version })))
      localStorage.setItem(CONSENT_STORAGE_KEY, fingerprint)
      setHidden(true)
    } catch (error) {
      alert(error.message || 'Erro ao registrar aceite de termos')
    } finally {
      setSaving(false)
    }
  }

  if (hidden) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-300 bg-slate-900/95 text-white backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-sm text-slate-100">
          {t('legal.bannerText')}{' '}
          <button
            type="button"
            onClick={() => setExpandedKey('privacy')}
            className="underline text-slate-200 hover:text-white"
          >
            {termSummary.get('privacy')?.title || t('legal.privacy')}
          </button>{' '}
          e{' '}
          <button
            type="button"
            onClick={() => setExpandedKey('terms')}
            className="underline text-slate-200 hover:text-white"
          >
            {termSummary.get('terms')?.title || t('legal.terms')}
          </button>
          .
        </p>
        {expandedKey ? (
          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">
                {termSummary.get(expandedKey)?.title || (expandedKey === 'privacy' ? t('legal.privacy') : t('legal.terms'))}
              </p>
              <button
                type="button"
                onClick={() => setExpandedKey('')}
                className="text-xs text-slate-300 hover:text-white"
              >
                {t('legal.close')}
              </button>
            </div>
            <p className="mt-2 text-slate-200 whitespace-pre-line line-clamp-6">
              {termSummary.get(expandedKey)?.content || t('legal.notAvailable')}
            </p>
          </div>
        ) : null}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={acceptAll}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            {saving ? t('legal.saving') : t('legal.accept')}
          </button>
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="px-4 py-2 rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-800"
          >
            {t('legal.later')}
          </button>
        </div>
      </div>
    </div>
  )
}
