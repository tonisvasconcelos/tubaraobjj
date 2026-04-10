import { useEffect, useMemo, useState } from 'react'
import Seo from '../components/seo/Seo'
import { createTrialReservation, getTrialSlots } from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'
import { trackEvent } from '../lib/analytics'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  interestProgram: '',
  notes: '',
}

export default function TrialClassPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [slots, setSlots] = useState([])
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const availableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          Number(slot.available_spots || 0) > 0 && new Date(slot.starts_at).getTime() > Date.now()
      ),
    [slots]
  )

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true)
      try {
        const from = new Date().toISOString()
        const to = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        const data = await getTrialSlots({ from, to })
        setSlots(Array.isArray(data) ? data : [])
      } catch (_error) {
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    loadSlots()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      if (!selectedSlotId) {
        throw new Error('Selecione um horário disponível para concluir o agendamento.')
      }
      await createTrialReservation({
        trialSlotId: Number(selectedSlotId),
        name: form.name,
        email: form.email,
        phone: form.phone,
        interestProgram: form.interestProgram || null,
        notes: form.notes || null,
      })
      setStatus('success')
      setForm(initialForm)
      setSelectedSlotId('')
      trackEvent('trial_submit', { source: 'trial_page_calendar', slot_id: selectedSlotId })
      const from = new Date().toISOString()
      const to = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
      const data = await getTrialSlots({ from, to })
      setSlots(Array.isArray(data) ? data : [])
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
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Escolha um horário disponível</p>
                {loadingSlots ? (
                  <p className="text-sm text-slate-500">Carregando horários...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No momento não há horários publicados. Envie seus dados e retornaremos com opções.
                  </p>
                ) : (
                  <div className="max-h-56 overflow-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-white">
                    {availableSlots.map((slot) => (
                      <label key={slot.id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trial-slot"
                          value={slot.id}
                          checked={String(selectedSlotId) === String(slot.id)}
                          onChange={(event) => setSelectedSlotId(event.target.value)}
                          className="mt-1"
                        />
                        <span className="text-sm text-slate-700">
                          <strong>{slot.branch_name || slot.title || 'Aula experimental'}</strong> -{' '}
                          {new Date(slot.starts_at).toLocaleString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ({slot.available_spots} vaga{slot.available_spots > 1 ? 's' : ''})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

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
