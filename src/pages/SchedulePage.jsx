import { useEffect, useMemo, useState } from 'react'
import { getSchedules } from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'
import Seo from '../components/seo/Seo'

function formatTime(t) {
  if (t == null || t === '') return ''
  return String(t).slice(0, 5)
}

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function SchedulePage() {
  const { t } = useLanguage()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSchedules()
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const byBranch = useMemo(() => {
    const m = {}
    for (const r of rows) {
      const raw = (r.branch_name || '').trim()
      const b = raw || '__default__'
      if (!m[b]) m[b] = {}
      const d = Number(r.day_of_week)
      if (!m[b][d]) m[b][d] = []
      m[b][d].push(r)
    }
    for (const b of Object.keys(m)) {
      for (const d of DAYS) {
        if (m[b][d]) {
          m[b][d].sort((a, bRow) => String(a.start_time).localeCompare(String(bRow.start_time)))
        }
      }
    }
    return m
  }, [rows])

  const branchNames = useMemo(
    () => Object.keys(byBranch).sort((a, b) => a.localeCompare(b)),
    [byBranch]
  )

  return (
    <>
      <Seo
        title="Horários das aulas — GFTeam Tubarão"
        description="Horários de treino da GFTeam Tubarão por unidade e dia da semana. Planeje suas aulas de Jiu-Jitsu no Rio de Janeiro."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Horarios', path: '/horarios' },
        ]}
      />
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-4">
          {t('schedule.title')}
        </h1>
        <p className="text-center text-slate-600 mb-10 sm:mb-12 text-sm sm:text-base">
          {t('schedule.subtitle')}
        </p>

        {loading ? (
          <p className="text-center text-slate-600">{t('schedule.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-slate-600 max-w-xl mx-auto">{t('schedule.empty')}</p>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {branchNames.map((branch) => (
              <div
                key={branch}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 px-6 py-4 bg-slate-100/80 border-b border-slate-200">
                  {branch === '__default__' ? t('schedule.unknownBranch') : branch}
                </h2>
                <div className="p-4 sm:p-6 space-y-8">
                  {DAYS.filter((d) => byBranch[branch][d]?.length).map((d) => (
                    <div key={d}>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">
                        {t(`schedule.day.${d}`)}
                      </h3>
                      <ul className="space-y-4">
                        {byBranch[branch][d].map((row) => {
                          const hasInstructor = Boolean(row.team_member_name?.trim())
                          const isFemaleOnly = row.target_public === 'female_only'
                          return (
                            <li
                              key={row.id}
                              className={`rounded-2xl border shadow-md overflow-hidden ${
                                isFemaleOnly
                                  ? 'border-pink-300 ring-2 ring-pink-200/90 bg-gradient-to-br from-pink-50/95 to-white shadow-pink-900/10'
                                  : 'border-slate-200/90 bg-gradient-to-br from-white to-slate-50/90 shadow-slate-900/5'
                              }`}
                            >
                              <div className="p-4 sm:p-5">
                                <div
                                  className={`flex gap-4 sm:gap-5 ${hasInstructor ? 'sm:items-center' : 'sm:items-start'}`}
                                >
                                  {hasInstructor ? (
                                    <div className="shrink-0">
                                      {row.team_member_photo_url ? (
                                        <img
                                          src={row.team_member_photo_url}
                                          alt={row.team_member_name}
                                          className={`w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg border ${
                                            isFemaleOnly
                                              ? 'border-pink-300 ring-pink-100'
                                              : 'border-slate-200/80'
                                          }`}
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div
                                          className={`w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center text-xl sm:text-2xl font-bold tracking-tight shadow-lg ring-4 ring-white border ${
                                            isFemaleOnly
                                              ? 'from-pink-600 to-pink-800 border-pink-400 ring-pink-100'
                                              : 'from-slate-700 to-slate-900 border-slate-600/30'
                                          }`}
                                          aria-label={row.team_member_name}
                                          role="img"
                                        >
                                          {initialsFromName(row.team_member_name)}
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                                      <h4 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight min-w-0 flex-1">
                                        {row.training_type}
                                      </h4>
                                      {isFemaleOnly ? (
                                        <span
                                          className="shrink-0 inline-flex items-center rounded-full border border-pink-300 bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-900 shadow-sm"
                                          title={t('schedule.badge.femaleOnly')}
                                        >
                                          {t('schedule.badge.femaleOnly')}
                                        </span>
                                      ) : null}
                                    </div>
                                    {hasInstructor ? (
                                      <p className="text-base sm:text-lg font-semibold text-slate-800">
                                        <span className="text-slate-500 font-medium not-italic">
                                          {t('schedule.instructorPrefix')}{' '}
                                        </span>
                                        <span className="text-slate-900">{row.team_member_name}</span>
                                        {row.team_member_role ? (
                                          <span className="font-normal text-slate-600 text-base sm:text-lg">
                                            {' '}
                                            · {row.team_member_role}
                                          </span>
                                        ) : null}
                                      </p>
                                    ) : null}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                      <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white tabular-nums shadow-sm">
                                        {formatTime(row.start_time)} – {formatTime(row.end_time)}
                                      </span>
                                    </div>
                                    {row.notes ? (
                                      <p className="text-sm sm:text-base text-slate-600 pt-1 whitespace-pre-wrap leading-relaxed border-t border-slate-200/80 mt-3 pt-3">
                                        {row.notes}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  )
}
