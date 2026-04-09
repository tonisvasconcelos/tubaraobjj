import { useState } from 'react'
import Seo from '../components/seo/Seo'
import { submitTrialLead } from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'
import { trackEvent } from '../lib/analytics'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  interestProgram: '',
  preferredTime: '',
  notes: '',
}

export default function TrialClassPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      await submitTrialLead(form)
      setStatus('success')
      setForm(initialForm)
      trackEvent('trial_submit', { source: 'trial_page' })
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : t('trial.error'))
    }
  }

  return (
    <>
      <Seo
        title="Aula experimental de Jiu-Jitsu em Vila Isabel | GFTeam Tubarão"
        description="Agende sua aula experimental na GFTeam Tubarão. Turmas para crianças, adultos, iniciantes e feminino em Vila Isabel, Rio de Janeiro."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Aula Experimental', path: '/aula-experimental' },
        ]}
      />
      <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 text-center">
            {t('trial.title')}
          </h1>
          <p className="mt-4 text-center text-slate-600 max-w-2xl mx-auto">
            {t('trial.subtitle')}
          </p>

          <div className="mt-10 bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-md p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder={t('trial.placeholder.name')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder={t('trial.placeholder.email')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder={t('trial.placeholder.phone')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <input
                  type="text"
                  value={form.interestProgram}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, interestProgram: event.target.value }))
                  }
                  placeholder={t('trial.placeholder.program')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <input
                type="text"
                value={form.preferredTime}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, preferredTime: event.target.value }))
                }
                placeholder={t('trial.placeholder.time')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder={t('trial.placeholder.notes')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              {status === 'success' ? (
                <p className="text-green-700 text-sm">{t('trial.success')}</p>
              ) : null}
              {status === 'error' ? (
                <p className="text-red-700 text-sm">{errorMessage || t('trial.error')}</p>
              ) : null}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold py-3 transition-colors"
              >
                {status === 'submitting' ? t('trial.submitting') : t('trial.submit')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
