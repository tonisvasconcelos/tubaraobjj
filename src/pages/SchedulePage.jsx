import { useEffect, useMemo, useState } from 'react'
import { getSchedules } from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'

function formatTime(t) {
  if (t == null || t === '') return ''
  return String(t).slice(0, 5)
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
                      <ul className="space-y-3">
                        {byBranch[branch][d].map((row) => (
                          <li
                            key={row.id}
                            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3"
                          >
                            <div className="font-semibold text-slate-900 tabular-nums shrink-0">
                              {formatTime(row.start_time)} – {formatTime(row.end_time)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800">{row.training_type}</p>
                              {row.notes ? (
                                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{row.notes}</p>
                              ) : null}
                            </div>
                          </li>
                        ))}
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
  )
}
