import { useEffect, useMemo, useState, useCallback } from 'react'
import Seo from '../components/seo/Seo'
import {
  createTrialPrivateRequest,
  createTrialReservation,
  getBranches,
  getTrialSlots,
} from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'
import { trackEvent } from '../lib/analytics'
import { Navigation } from 'lucide-react'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  interestProgram: '',
  hasGi: '',
  giSize: '',
  hasPreviousExperience: '',
  experienceDuration: '',
  currentBelt: '',
  stripeCount: '',
  previousTeam: '',
  gender: '',
  preferFemaleInstructor: '',
  notes: '',
}

export default function TrialClassPage() {
  const baseUrl = import.meta.env.BASE_URL
  const { t } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [selectedClassType, setSelectedClassType] = useState('experimental_group')
  const [privateDate, setPrivateDate] = useState('')
  const [privateTime, setPrivateTime] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [directionsHint, setDirectionsHint] = useState('')
  const [directionsLoading, setDirectionsLoading] = useState(false)

  const selectedBranch = useMemo(
    () => branches.find((b) => String(b.id) === String(selectedBranchId)),
    [branches, selectedBranchId]
  )

  const availableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          Number(slot.available_spots || 0) > 0 && new Date(slot.starts_at).getTime() > Date.now()
      ),
    [slots]
  )

  useEffect(() => {
    let cancelled = false
    setLoadingBranches(true)
    getBranches()
      .then((data) => {
        if (!cancelled) setBranches(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setBranches([])
      })
      .finally(() => {
        if (!cancelled) setLoadingBranches(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedBranchId) {
      setSlots([])
      setSelectedSlotId('')
      return
    }
    if (selectedClassType !== 'experimental_group') {
      setSlots([])
      setSelectedSlotId('')
      return
    }
    let cancelled = false
    async function loadSlots() {
      setLoadingSlots(true)
      try {
        const from = new Date().toISOString()
        const to = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        const data = await getTrialSlots({
          from,
          to,
          branch_id: selectedBranchId,
          class_type: 'experimental_group',
        })
        if (!cancelled) setSlots(Array.isArray(data) ? data : [])
      } catch (_error) {
        if (!cancelled) setSlots([])
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    }
    setSelectedSlotId('')
    loadSlots()
    return () => {
      cancelled = true
    }
  }, [selectedBranchId, selectedClassType])

  useEffect(() => {
    setDirectionsHint('')
  }, [selectedBranchId])

  useEffect(() => {
    setStatus('idle')
    setErrorMessage('')
    setSelectedSlotId('')
  }, [selectedClassType])

  function isWeekdayDate(dateText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateText || ''))) return false
    const [year, month, day] = String(dateText).split('-').map((n) => Number(n))
    const dt = new Date(Date.UTC(year, month - 1, day))
    const weekday = dt.getUTCDay()
    return weekday >= 1 && weekday <= 5
  }

  function isAllowedPrivateTime(timeText) {
    if (!/^\d{2}:\d{2}$/.test(String(timeText || ''))) return false
    const [h, m] = String(timeText).split(':').map((n) => Number(n))
    if (Number.isNaN(h) || Number.isNaN(m)) return false
    const minutes = h * 60 + m
    return minutes >= 8 * 60 && minutes <= 17 * 60
  }

  const openDirections = useCallback(() => {
    if (!selectedBranch?.address) return
    const dest = encodeURIComponent(selectedBranch.address)
    const fallback = () => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank', 'noopener,noreferrer')
    }
    setDirectionsHint('')
    if (!navigator.geolocation) {
      setDirectionsHint(t('trial.directionsUnavailable'))
      fallback()
      return
    }
    setDirectionsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${dest}`
        window.open(url, '_blank', 'noopener,noreferrer')
        setDirectionsLoading(false)
      },
      (err) => {
        setDirectionsLoading(false)
        if (err.code === 1) {
          setDirectionsHint(t('trial.directionsDenied'))
        } else {
          setDirectionsHint(t('trial.directionsDenied'))
        }
        fallback()
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 }
    )
  }, [selectedBranch, t])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      if (!selectedBranchId) {
        throw new Error(t('trial.branchRequired'))
      }
      if (!form.hasGi) throw new Error(t('trial.hasGiRequired'))
      if (form.hasGi === 'no' && !form.giSize) throw new Error(t('trial.giSizeRequired'))
      if (!form.hasPreviousExperience) throw new Error(t('trial.previousExperienceRequired'))
      if (form.hasPreviousExperience === 'yes') {
        if (!form.experienceDuration.trim()) throw new Error(t('trial.experienceDurationRequired'))
        if (!form.currentBelt.trim()) throw new Error(t('trial.currentBeltRequired'))
        const stripes = Number(form.stripeCount)
        if (!Number.isInteger(stripes) || stripes < 0 || stripes > 20) {
          throw new Error(t('trial.stripeCountInvalid'))
        }
      }
      if (!form.gender) throw new Error(t('trial.genderRequired'))
      if (form.gender === 'female' && !form.preferFemaleInstructor) {
        throw new Error(t('trial.preferFemaleInstructorRequired'))
      }

      const sharedPayload = {
        hasGi: form.hasGi === 'yes',
        giSize: form.hasGi === 'no' ? form.giSize : null,
        hasPreviousExperience: form.hasPreviousExperience === 'yes',
        experienceDuration:
          form.hasPreviousExperience === 'yes' ? form.experienceDuration.trim() : null,
        currentBelt: form.hasPreviousExperience === 'yes' ? form.currentBelt.trim() : null,
        stripeCount:
          form.hasPreviousExperience === 'yes' ? Number(form.stripeCount || 0) : null,
        previousTeam:
          form.hasPreviousExperience === 'yes' && form.previousTeam.trim()
            ? form.previousTeam.trim()
            : null,
        gender: form.gender,
        preferFemaleInstructor:
          form.gender === 'female' ? form.preferFemaleInstructor === 'yes' : null,
      }

      if (selectedClassType === 'private_class') {
        if (!privateDate) throw new Error(t('trial.privateDateRequired'))
        if (!isWeekdayDate(privateDate)) throw new Error(t('trial.privateDateWeekdayOnly'))
        if (!privateTime) throw new Error(t('trial.privateTimeRequired'))
        if (!isAllowedPrivateTime(privateTime)) throw new Error(t('trial.privateTimeRangeError'))
        await createTrialPrivateRequest({
          branchId: Number(selectedBranchId),
          name: form.name,
          email: form.email,
          phone: form.phone,
          requestedDate: privateDate,
          requestedTime: privateTime,
          interestProgram: form.interestProgram || null,
          notes: form.notes || null,
          ...sharedPayload,
        })
      } else {
        if (!selectedSlotId) {
          throw new Error(t('trial.slotRequired'))
        }
        await createTrialReservation({
          trialSlotId: Number(selectedSlotId),
          branchId: Number(selectedBranchId),
          name: form.name,
          email: form.email,
          phone: form.phone,
          interestProgram: form.interestProgram || null,
          notes: form.notes || null,
          ...sharedPayload,
        })
      }
      setStatus('success')
      setForm(initialForm)
      setSelectedSlotId('')
      setPrivateDate('')
      setPrivateTime('')
      trackEvent('trial_submit', {
        source: selectedClassType === 'private_class' ? 'trial_page_private' : 'trial_page_calendar',
        slot_id: selectedSlotId,
        branch_id: selectedBranchId,
        class_type: selectedClassType,
      })
      if (selectedClassType === 'experimental_group') {
        const from = new Date().toISOString()
        const to = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        const data = await getTrialSlots({
          from,
          to,
          branch_id: selectedBranchId,
          class_type: 'experimental_group',
        })
        setSlots(Array.isArray(data) ? data : [])
      }
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
          <div className="mt-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden p-6 sm:p-8">
            <div className="-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 sm:mb-8">
              <img
                src={`${baseUrl}images/BookingClassExp.png`}
                alt=""
                width={1200}
                height={400}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full max-h-[200px] sm:max-h-[260px] md:max-h-[300px] object-cover object-center"
              />
            </div>
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 text-center">
                {t('trial.title')}
              </h1>
              <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
                {t('trial.subtitle')}
              </p>
            </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('trial.hasGiLabel')} *
                  </label>
                  <select
                    required
                    value={form.hasGi}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hasGi: event.target.value,
                        giSize: event.target.value === 'no' ? prev.giSize : '',
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">{t('trial.selectOption')}</option>
                    <option value="yes">{t('trial.yes')}</option>
                    <option value="no">{t('trial.no')}</option>
                  </select>
                </div>
                {form.hasGi === 'no' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('trial.giSizeLabel')} *
                    </label>
                    <select
                      required
                      value={form.giSize}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, giSize: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <option value="">{t('trial.selectOption')}</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="A3">A3</option>
                      <option value="A4">A4</option>
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('trial.previousExperienceLabel')} *
                  </label>
                  <select
                    required
                    value={form.hasPreviousExperience}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hasPreviousExperience: event.target.value,
                        experienceDuration: event.target.value === 'yes' ? prev.experienceDuration : '',
                        currentBelt: event.target.value === 'yes' ? prev.currentBelt : '',
                        stripeCount: event.target.value === 'yes' ? prev.stripeCount : '',
                        previousTeam: event.target.value === 'yes' ? prev.previousTeam : '',
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">{t('trial.selectOption')}</option>
                    <option value="yes">{t('trial.yes')}</option>
                    <option value="no">{t('trial.no')}</option>
                  </select>
                </div>
                {form.hasPreviousExperience === 'yes' ? (
                  <input
                    required
                    type="text"
                    value={form.experienceDuration}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, experienceDuration: event.target.value }))
                    }
                    placeholder={t('trial.experienceDurationLabel')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                ) : null}
              </div>

              {form.hasPreviousExperience === 'yes' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    required
                    type="text"
                    value={form.currentBelt}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, currentBelt: event.target.value }))
                    }
                    placeholder={t('trial.currentBeltLabel')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <input
                    required
                    type="number"
                    min={0}
                    max={20}
                    value={form.stripeCount}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, stripeCount: event.target.value }))
                    }
                    placeholder={t('trial.stripeCountLabel')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <input
                    type="text"
                    value={form.previousTeam}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, previousTeam: event.target.value }))
                    }
                    placeholder={t('trial.previousTeamLabel')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('trial.genderLabel')} *
                  </label>
                  <select
                    required
                    value={form.gender}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        gender: event.target.value,
                        preferFemaleInstructor:
                          event.target.value === 'female' ? prev.preferFemaleInstructor : '',
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">{t('trial.selectOption')}</option>
                    <option value="female">{t('trial.genderFemale')}</option>
                    <option value="male">{t('trial.genderMale')}</option>
                    <option value="prefer_not_to_inform">{t('trial.genderPreferNot')}</option>
                  </select>
                </div>
                {form.gender === 'female' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('trial.preferFemaleInstructorLabel')} *
                    </label>
                    <select
                      required
                      value={form.preferFemaleInstructor}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          preferFemaleInstructor: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <option value="">{t('trial.selectOption')}</option>
                      <option value="yes">{t('trial.yes')}</option>
                      <option value="no">{t('trial.no')}</option>
                    </select>
                  </div>
                ) : null}
              </div>

              <div>
                <label htmlFor="trial-class-type" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('trial.classTypeLabel')} *
                </label>
                <select
                  id="trial-class-type"
                  required
                  value={selectedClassType}
                  onChange={(event) => setSelectedClassType(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="experimental_group">{t('trial.classType.experimental_group')}</option>
                  <option value="private_class">{t('trial.classType.private_class')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="trial-branch" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('trial.branchLabel')} *
                </label>
                <select
                  id="trial-branch"
                  required
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  disabled={loadingBranches}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
                >
                  <option value="">{t('trial.branchPlaceholder')}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBranchId ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={openDirections}
                    disabled={directionsLoading || !selectedBranch?.address}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Navigation className="w-4 h-4" aria-hidden />
                    {directionsLoading ? t('trial.directionsLoading') : t('trial.directionsButton')}
                  </button>
                  {directionsHint ? (
                    <p className="text-sm text-amber-800">{directionsHint}</p>
                  ) : null}
                </div>
              ) : null}

              {selectedClassType === 'private_class' ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">{t('trial.privateScheduleLabel')}</p>
                  <p className="text-sm text-slate-500">{t('trial.privateScheduleHint')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="private-date" className="block text-sm font-medium text-slate-700 mb-2">
                        {t('trial.privateDateLabel')} *
                      </label>
                      <input
                        id="private-date"
                        required
                        type="date"
                        value={privateDate}
                        onChange={(event) => setPrivateDate(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="private-time" className="block text-sm font-medium text-slate-700 mb-2">
                        {t('trial.privateTimeLabel')} *
                      </label>
                      <input
                        id="private-time"
                        required
                        type="time"
                        min="08:00"
                        max="17:00"
                        step="1800"
                        value={privateTime}
                        onChange={(event) => setPrivateTime(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t('trial.slotsLabel')}</p>
                  {!selectedBranchId ? (
                    <p className="text-sm text-slate-500">{t('trial.selectBranchFirst')}</p>
                  ) : loadingSlots ? (
                    <p className="text-sm text-slate-500">{t('trial.slotsLoading')}</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-slate-500">{t('trial.slotsEmpty')}</p>
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
                            <strong>{slot.title || t('nav.trial')}</strong> —{' '}
                            {new Date(slot.starts_at).toLocaleString(undefined, {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {slot.instructor_name
                              ? ` · ${t('trial.instructorLine', { name: slot.instructor_name })}`
                              : ''}{' '}
                            · {slot.available_spots}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder={t('trial.placeholder.notes')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />

              {status === 'success' ? (
                <p className="text-green-700 text-sm">
                  {selectedClassType === 'private_class'
                    ? t('trial.privateSuccess')
                    : t('trial.success')}
                </p>
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
