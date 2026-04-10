/**
 * Build trial slot instants in America/São Paulo wall time, stored as UTC ISO strings.
 * Brazil (official time) is UTC−3 year-round (no DST since 2019).
 * Weekdays: 0 = Sunday … 6 = Saturday (same convention as Date.prototype.getUTCDay() for civil dates).
 */

export const SP_UTC_OFFSET_HOURS = 3
export const MAX_BULK_OCCURRENCES = 366

export function parseHHMM(s) {
  const m = String(s || '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) return null
  return { h, m: min }
}

/** Civil date in calendar → UTC instant for that local wall clock in São Paulo. */
export function brWallToUtcIso(y, month, day, hour, minute) {
  return new Date(Date.UTC(y, month - 1, day, hour + SP_UTC_OFFSET_HOURS, minute, 0)).toISOString()
}

/**
 * @param {string} startYmd YYYY-MM-DD
 * @param {string} endYmd YYYY-MM-DD inclusive
 * @yields {{ y: number, m: number, d: number, weekday: number }}
 */
export function* eachCalendarDayInclusive(startYmd, endYmd) {
  const [sy, sm, sd] = startYmd.split('-').map(Number)
  const [ey, em, ed] = endYmd.split('-').map(Number)
  const t0 = Date.UTC(sy, sm - 1, sd)
  const t1 = Date.UTC(ey, em - 1, ed)
  for (let t = t0; t <= t1; t += 86400000) {
    const dt = new Date(t)
    yield {
      y: dt.getUTCFullYear(),
      m: dt.getUTCMonth() + 1,
      d: dt.getUTCDate(),
      weekday: dt.getUTCDay(),
    }
  }
}

export function countMatchingWeekdays(startYmd, endYmd, weekdaysSet) {
  let n = 0
  for (const day of eachCalendarDayInclusive(startYmd, endYmd)) {
    if (weekdaysSet.has(day.weekday)) n += 1
  }
  return n
}
