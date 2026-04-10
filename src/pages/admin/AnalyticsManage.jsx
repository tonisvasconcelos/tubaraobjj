import { useEffect, useMemo, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2 } from 'lucide-react'

function defaultFrom() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10)
}

function formatNum(value) {
  return Number(value || 0).toLocaleString('pt-BR')
}

function toIsoRange(from, to) {
  return {
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
  }
}

function buildPolyline(data, key, width, height, padding) {
  if (!data.length) return ''
  const values = data.map((d) => Number(d[key] || 0))
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0
  const span = max - min || 1

  return data
    .map((d, index) => {
      const x = padding + index * xStep
      const y = height - padding - ((Number(d[key] || 0) - min) / span) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

export default function AnalyticsManage() {
  const [from, setFrom] = useState(defaultFrom())
  const [to, setTo] = useState(defaultTo())
  const [siteId, setSiteId] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [deviceType, setDeviceType] = useState('')

  const [overview, setOverview] = useState(null)
  const [activeNow, setActiveNow] = useState(null)
  const [timeseries, setTimeseries] = useState([])
  const [regionBreakdown, setRegionBreakdown] = useState([])
  const [deviceBreakdown, setDeviceBreakdown] = useState([])
  const [topPages, setTopPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filters = useMemo(
    () => ({
      ...toIsoRange(from, to),
      siteId: siteId || undefined,
      countryCode: countryCode || undefined,
      deviceType: deviceType || undefined,
    }),
    [from, to, siteId, countryCode, deviceType]
  )

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setError('')
      setLoading(true)
      try {
        const [o, a, ts, rb, db, tp] = await Promise.all([
          admin.analytics.overview(filters),
          admin.analytics.activeNow({ siteId: filters.siteId }),
          admin.analytics.timeseries({ ...filters, interval: 'auto' }),
          admin.analytics.regionBreakdown(filters),
          admin.analytics.deviceBreakdown(filters),
          admin.analytics.topPages({ ...filters, limit: 10 }),
        ])
        if (cancelled) return
        setOverview(o || {})
        setActiveNow(a || {})
        setTimeseries(Array.isArray(ts) ? ts : [])
        setRegionBreakdown(Array.isArray(rb) ? rb : [])
        setDeviceBreakdown(Array.isArray(db) ? db : [])
        setTopPages(Array.isArray(tp) ? tp : [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Falha ao carregar analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [filters])

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const a = await admin.analytics.activeNow({ siteId: filters.siteId })
        setActiveNow(a || {})
      } catch {
        /* ignore polling failures */
      }
    }, 10_000)
    return () => clearInterval(timer)
  }, [filters.siteId])

  const chartSeries = useMemo(() => {
    return timeseries.map((b) => ({
      ...b,
      bucketLabel: new Date(b.bucketStart).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
    }))
  }, [timeseries])

  const chartWidth = 900
  const chartHeight = 260
  const chartPadding = 24

  const pvPolyline = buildPolyline(chartSeries, 'pageViews', chartWidth, chartHeight, chartPadding)
  const sessPolyline = buildPolyline(chartSeries, 'sessions', chartWidth, chartHeight, chartPadding)

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Website Analytics</h1>

      <section className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <label className="text-sm text-slate-700">
            <span className="block mb-1">From</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1">To</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1">Site</span>
            <input
              type="text"
              placeholder="default"
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1">Country</span>
            <input
              type="text"
              placeholder="All"
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="block mb-1">Device</span>
            <select
              value={deviceType}
              onChange={(event) => setDeviceType(event.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">All</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <strong>Active sessions (last 5 min):</strong>{' '}
        {activeNow?.activeSessionsNow != null ? formatNum(activeNow.activeSessionsNow) : '—'} — auto-refresh every 10s
      </section>

      {error ? (
        <section className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full bg-white rounded-xl shadow p-6 flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando analytics...
          </div>
        ) : (
          <>
            <article className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-slate-500">Page Views</p>
              <p className="text-3xl font-bold text-slate-900">{formatNum(overview?.totalPageViews)}</p>
            </article>
            <article className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-slate-500">Active Sessions (now)</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatNum(activeNow?.activeSessionsNow ?? overview?.activeSessionsNow)}
              </p>
            </article>
            <article className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-slate-500">Mobile %</p>
              <p className="text-3xl font-bold text-slate-900">{Number(overview?.mobileShare || 0).toFixed(1)}%</p>
            </article>
            <article className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-slate-500">Top Region</p>
              <p className="text-3xl font-bold text-slate-900">{overview?.topCountry || '—'}</p>
            </article>
          </>
        )}
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Page views & sessions over time</h2>
        {chartSeries.length === 0 ? (
          <p className="text-sm text-slate-500">No time-series data for this range.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full min-w-[700px] h-64"
              role="img"
              aria-label="Page views and sessions chart"
            >
              <polyline
                points={pvPolyline}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={sessPolyline}
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <article className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Region breakdown</h2>
          {regionBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500">No region data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 pr-3">Country</th>
                    <th className="py-2 pr-3">Region</th>
                    <th className="py-2 pr-3">Sessions</th>
                    <th className="py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {regionBreakdown.map((row, idx) => (
                    <tr key={`${row.countryCode}-${row.region}-${idx}`} className="border-b border-slate-100">
                      <td className="py-2 pr-3">{row.countryCode}</td>
                      <td className="py-2 pr-3">{row.region}</td>
                      <td className="py-2 pr-3">{formatNum(row.count)}</td>
                      <td className="py-2">{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Device breakdown</h2>
          {deviceBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500">No device data.</p>
          ) : (
            <div className="space-y-2">
              {deviceBreakdown.map((row) => (
                <div key={row.deviceType} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700">{row.deviceType}</span>
                    <span className="text-slate-500">
                      {formatNum(row.count)} ({row.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-700" style={{ width: `${Math.min(row.percentage, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Top pages</h2>
        {topPages.length === 0 ? (
          <p className="text-sm text-slate-500">No page data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2 pr-3">Page path</th>
                  <th className="py-2">Page views</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((row, idx) => (
                  <tr key={`${row.pagePath}-${idx}`} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <code className="text-xs text-slate-700">{row.pagePath || '/'}</code>
                    </td>
                    <td className="py-2">{formatNum(row.pageViews)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
