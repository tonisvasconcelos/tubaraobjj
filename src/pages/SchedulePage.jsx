import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { getBranches, getSchedules } from '../services/publicApi'
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

function branchKey(row) {
  const raw = (row.branch_name || '').trim()
  return raw || '__default__'
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  let line = ''
  let cursorY = y
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY)
      line = word
      cursorY += lineHeight
    } else {
      line = next
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY)
    cursorY += lineHeight
  }
  return cursorY
}

async function generateShareCardImage({
  trainingType,
  dayLabel,
  timeRange,
  branchName,
  instagramHandle,
  instructorName,
  instructorPhotoUrl,
  academyLogoUrl,
  callText,
}) {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível')

  const bg = ctx.createLinearGradient(0, 0, size, size)
  bg.addColorStop(0, '#0f172a')
  bg.addColorStop(0.45, '#1d4ed8')
  bg.addColorStop(1, '#9333ea')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(56, 56, size - 112, size - 112)

  ctx.fillStyle = 'rgba(15,23,42,0.55)'
  ctx.fillRect(86, 86, size - 172, size - 172)

  const brandTopY = 140
  if (academyLogoUrl) {
    try {
      const logo = await new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = academyLogoUrl
      })
      const logoHeight = 92
      const logoWidth = Math.min((logo.width / logo.height) * logoHeight, 360)
      ctx.drawImage(logo, 96, brandTopY - 72, logoWidth, logoHeight)
    } catch {
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 52px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      ctx.fillText('GFTeam Tubarão', 96, brandTopY)
    }
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 52px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    ctx.fillText('GFTeam Tubarão', 96, brandTopY)
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.font = '500 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  ctx.fillText(branchName || 'Unidade', 96, 220)

  if (instagramHandle) {
    const displayHandle = instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`
    ctx.fillStyle = 'rgba(236, 72, 153, 0.18)'
    ctx.fillRect(size - 390, 108, 280, 58)
    ctx.fillStyle = '#fbcfe8'
    ctx.font = '700 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    ctx.fillText(displayHandle, size - 366, 146)
  }

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 66px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  let cursorY = drawWrappedText(ctx, trainingType, 96, 320, size - 192, 76)

  ctx.fillStyle = '#dbeafe'
  ctx.font = '600 42px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  cursorY = drawWrappedText(ctx, `${dayLabel} • ${timeRange}`, 96, cursorY + 24, size - 192, 52)

  if (instructorPhotoUrl) {
    try {
      const photo = await new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = instructorPhotoUrl
      })
      const avatarSize = 120
      const avatarX = 96
      const avatarY = cursorY + 12
      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(photo, avatarX, avatarY, avatarSize, avatarSize)
      ctx.restore()
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.stroke()
    } catch {
      // ignore photo draw failure
    }
  }

  if (instructorName) {
    ctx.fillStyle = '#f8fafc'
    ctx.font = '500 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    const instructorX = instructorPhotoUrl ? 236 : 96
    cursorY = drawWrappedText(ctx, `Prof(a). ${instructorName}`, instructorX, cursorY + 62, size - 280, 44)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.14)'
  ctx.fillRect(96, size - 250, size - 192, 130)
  ctx.fillStyle = '#f8fafc'
  ctx.font = '700 40px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  drawWrappedText(ctx, callText, 120, size - 198, size - 240, 48)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Falha ao gerar imagem'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export default function SchedulePage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterUnit, setFilterUnit] = useState(() => searchParams.get('unit') || 'all')
  const [filterTeacher, setFilterTeacher] = useState(() => searchParams.get('teacher') || 'all')
  const [filterTarget, setFilterTarget] = useState(() => searchParams.get('target') || 'all')

  useEffect(() => {
    Promise.all([getSchedules(), getBranches()])
      .then(([scheduleData, branchData]) => {
        setRows(Array.isArray(scheduleData) ? scheduleData : [])
        setBranches(Array.isArray(branchData) ? branchData : [])
      })
      .catch(() => {
        setRows([])
        setBranches([])
      })
      .finally(() => setLoading(false))
  }, [])

  const branchAddressByName = useMemo(() => {
    const map = new Map()
    for (const branch of branches) {
      const key = String(branch?.name || '').trim().toLocaleLowerCase()
      if (!key) continue
      const address = String(branch?.address || '').trim()
      if (address) map.set(key, address)
    }
    return map
  }, [branches])

  function openBranchDirections(branchName) {
    if (branchName === '__default__') {
      window.location.assign('/addresses')
      return
    }
    const address = branchAddressByName.get(String(branchName || '').trim().toLocaleLowerCase())
    if (!address) {
      window.location.assign('/addresses')
      return
    }
    const destination = encodeURIComponent(address)
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const unitOptions = useMemo(() => {
    const keys = new Set()
    for (const r of rows) keys.add(branchKey(r))
    return [...keys].sort((a, b) => a.localeCompare(b))
  }, [rows])

  const { teacherOptions, hasNoInstructorOption } = useMemo(() => {
    const byId = new Map()
    let unassigned = false
    for (const r of rows) {
      const id = r.team_member_id
      if (id == null || id === '') {
        unassigned = true
      } else {
        const n = Number(id)
        if (!byId.has(n)) {
          byId.set(n, String(r.team_member_name || '').trim() || `#${n}`)
        }
      }
    }
    const teacherOptions = [...byId.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: 'base' }))
      .map(([id, name]) => ({ id, name }))
    return { teacherOptions, hasNoInstructorOption: unassigned }
  }, [rows])

  useEffect(() => {
    if (loading) return

    const validUnits = new Set(unitOptions)
    const validTeachers = new Set(teacherOptions.map((opt) => String(opt.id)))
    const validTargets = new Set(['all', 'unisex', 'female_only'])

    if (filterUnit !== 'all' && !validUnits.has(filterUnit)) {
      setFilterUnit('all')
    }
    if (
      filterTeacher !== 'all' &&
      filterTeacher !== 'none' &&
      !validTeachers.has(String(filterTeacher))
    ) {
      setFilterTeacher('all')
    }
    if (filterTeacher === 'none' && !hasNoInstructorOption) {
      setFilterTeacher('all')
    }
    if (!validTargets.has(filterTarget)) {
      setFilterTarget('all')
    }
  }, [filterUnit, filterTeacher, filterTarget, unitOptions, teacherOptions, hasNoInstructorOption])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterUnit !== 'all' && branchKey(r) !== filterUnit) return false
      if (filterTeacher !== 'all') {
        if (filterTeacher === 'none') {
          if (r.team_member_id != null && r.team_member_id !== '') return false
        } else if (String(r.team_member_id) !== String(filterTeacher)) {
          return false
        }
      }
      if (filterTarget !== 'all') {
        const isFemaleOnly = r.target_public === 'female_only'
        if (filterTarget === 'female_only' && !isFemaleOnly) return false
        if (filterTarget === 'unisex' && isFemaleOnly) return false
      }
      return true
    })
  }, [rows, filterUnit, filterTeacher, filterTarget])

  const hasActiveFilters =
    filterUnit !== 'all' || filterTeacher !== 'all' || filterTarget !== 'all'

  function clearFilters() {
    setFilterUnit('all')
    setFilterTeacher('all')
    setFilterTarget('all')
  }

  async function shareClassCard({ row, branch, day }) {
    try {
      const dayLabel = t(`schedule.day.${day}`)
      const timeRange = `${formatTime(row.start_time)} – ${formatTime(row.end_time)}`
      const instagramHandle = String(row.instagram_handle || '')
        .trim()
        .replace(/^@+/, '')
        .toLowerCase()
      const blob = await generateShareCardImage({
        trainingType: row.training_type,
        dayLabel,
        timeRange,
        branchName: branch === '__default__' ? t('schedule.unknownBranch') : branch,
        instagramHandle,
        instructorName: row.team_member_name || '',
        instructorPhotoUrl: row.team_member_photo_url || '',
        academyLogoUrl: row.academy_logo_url || '',
        callText: t('schedule.share.call'),
      })

      const file = new File([blob], 'agenda-gfteam-tubarao.png', { type: 'image/png' })
      const mentionText = instagramHandle ? ` @${instagramHandle}` : ''
      const shareText = `${row.training_type} • ${dayLabel} ${timeRange}${mentionText} • ${window.location.origin}/horarios`

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: t('schedule.share.title'),
          text: shareText,
          files: [file],
        })
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'agenda-gfteam-tubarao.png'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      alert(t('schedule.share.downloadFallback'))
    } catch (error) {
      alert(t('schedule.share.error'))
    }
  }

  const byBranch = useMemo(() => {
    const m = {}
    for (const r of filteredRows) {
      const b = branchKey(r)
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
  }, [filteredRows])

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
        <div className="mb-8 sm:mb-10 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-5 py-6 sm:px-8 sm:py-8 shadow-md shadow-slate-900/10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-3 sm:mb-4">
            {t('schedule.title')}
          </h1>
          <p className="text-center text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('schedule.subtitle')}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-slate-600">{t('schedule.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-slate-600 max-w-xl mx-auto">{t('schedule.empty')}</p>
        ) : (
          <>
            <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-4 sm:px-6 shadow-md shadow-slate-900/10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div>
                  <label htmlFor="schedule-filter-unit" className="mb-1 block text-xs font-medium text-slate-600">
                    {t('schedule.filter.unit')}
                  </label>
                  <select
                    id="schedule-filter-unit"
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">{t('schedule.filter.all')}</option>
                    {unitOptions.map((key) => (
                      <option key={key} value={key}>
                        {key === '__default__' ? t('schedule.unknownBranch') : key}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="schedule-filter-teacher" className="mb-1 block text-xs font-medium text-slate-600">
                    {t('schedule.filter.teacher')}
                  </label>
                  <select
                    id="schedule-filter-teacher"
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">{t('schedule.filter.all')}</option>
                    {hasNoInstructorOption ? (
                      <option value="none">{t('schedule.filter.noInstructor')}</option>
                    ) : null}
                    {teacherOptions.map((opt) => (
                      <option key={opt.id} value={String(opt.id)}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="schedule-filter-target" className="mb-1 block text-xs font-medium text-slate-600">
                    {t('schedule.filter.target')}
                  </label>
                  <select
                    id="schedule-filter-target"
                    value={filterTarget}
                    onChange={(e) => setFilterTarget(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="all">{t('schedule.filter.all')}</option>
                    <option value="unisex">{t('schedule.filter.unisex')}</option>
                    <option value="female_only">{t('schedule.filter.femaleOnlyOption')}</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters ? (
                <div className="mt-3 flex justify-end border-t border-slate-200/80 pt-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900"
                  >
                    {t('schedule.filter.clear')}
                  </button>
                </div>
              ) : null}
            </div>

            {filteredRows.length === 0 ? (
              <p className="text-center text-slate-600 max-w-xl mx-auto">{t('schedule.emptyFiltered')}</p>
            ) : (
          <div className="space-y-10 sm:space-y-12">
            {branchNames.map((branch) => (
              <div
                key={branch}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden"
              >
                <div className="px-6 py-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {branch === '__default__' ? t('schedule.unknownBranch') : branch}
                  </h2>
                  <button
                    type="button"
                    onClick={() => openBranchDirections(branch)}
                    className="shrink-0 inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {t('addresses.directionsButton')}
                  </button>
                </div>
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
                                      <button
                                        type="button"
                                        onClick={() => shareClassCard({ row, branch, day: d })}
                                        className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                        {t('schedule.share.button')}
                                      </button>
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
          </>
        )}
      </div>
    </section>
    </>
  )
}
