import pool from './pool.js'

function buildEventFilters(filters = {}) {
  const conditions = []
  const params = []
  let idx = 1

  if (filters.from) {
    conditions.push(`e.occurred_at >= $${idx}`)
    params.push(filters.from)
    idx += 1
  }
  if (filters.to) {
    conditions.push(`e.occurred_at <= $${idx}`)
    params.push(filters.to)
    idx += 1
  }
  if (filters.siteId) {
    conditions.push(`e.site_id = $${idx}`)
    params.push(filters.siteId)
    idx += 1
  }
  if (filters.countryCode) {
    conditions.push(`e.country_code = $${idx}`)
    params.push(filters.countryCode)
    idx += 1
  }
  if (filters.deviceType) {
    conditions.push(`e.device_type = $${idx}`)
    params.push(filters.deviceType)
    idx += 1
  }
  if (filters.excludeBots !== false) {
    conditions.push('e.is_bot = false')
  }

  return { where: conditions.length ? `AND ${conditions.join(' AND ')}` : '', params }
}

export async function insertEvent(row) {
  const {
    eventType,
    occurredAt,
    siteId = 'default',
    sessionId,
    userId = null,
    pagePath = '',
    referrer = null,
    deviceType = null,
    userAgentFamily = null,
    countryCode = null,
    region = null,
    city = null,
    timezone = null,
    isBot = false,
    metadata = null,
  } = row

  await pool.query(
    `INSERT INTO analytics_events (
      event_type, occurred_at, site_id, session_id, user_id, page_path, referrer,
      device_type, user_agent_family, country_code, region, city, timezone, is_bot, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      eventType,
      occurredAt,
      siteId,
      sessionId,
      userId,
      pagePath,
      referrer,
      deviceType,
      userAgentFamily,
      countryCode,
      region,
      city,
      timezone,
      isBot,
      metadata ? JSON.stringify(metadata) : null,
    ]
  )
}

export async function upsertSession(row) {
  const {
    sessionId,
    siteId = 'default',
    startedAt,
    lastSeenAt,
    deviceType = null,
    countryCode = null,
    region = null,
    userId = null,
  } = row

  await pool.query(
    `INSERT INTO analytics_sessions (session_id, site_id, started_at, last_seen_at, device_type, country_code, region, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (session_id) DO UPDATE SET
       last_seen_at = EXCLUDED.last_seen_at,
       ended_at = NULL,
       device_type = COALESCE(EXCLUDED.device_type, analytics_sessions.device_type),
       country_code = COALESCE(EXCLUDED.country_code, analytics_sessions.country_code),
       region = COALESCE(EXCLUDED.region, analytics_sessions.region),
       user_id = COALESCE(EXCLUDED.user_id, analytics_sessions.user_id)`,
    [sessionId, siteId, startedAt, lastSeenAt, deviceType, countryCode, region, userId]
  )
}

export async function endSession(sessionId, endedAt = new Date().toISOString()) {
  await pool.query(
    `UPDATE analytics_sessions
     SET ended_at = $2::timestamptz, last_seen_at = GREATEST(last_seen_at, $2::timestamptz)
     WHERE session_id = $1`,
    [sessionId, endedAt]
  )
}

export async function getOverview(filters) {
  const { where, params } = buildEventFilters(filters)

  const pvResult = await pool.query(
    `SELECT COUNT(*) AS cnt FROM analytics_events e WHERE e.event_type = 'page_view' ${where}`,
    params
  )
  const totalPageViews = Number(pvResult.rows[0]?.cnt || 0)

  const activeParams = []
  let activeSiteClause = ''
  if (filters?.siteId) {
    activeParams.push(filters.siteId)
    activeSiteClause = `AND s.site_id = $${activeParams.length}`
  }
  activeParams.push(new Date(Date.now() - 5 * 60 * 1000).toISOString())
  const activeResult = await pool.query(
    `SELECT COUNT(*) AS cnt FROM analytics_sessions s
     WHERE s.last_seen_at >= $${activeParams.length} ${activeSiteClause}`,
    activeParams
  )
  const activeSessionsNow = Number(activeResult.rows[0]?.cnt || 0)

  const mobileResult = await pool.query(
    `SELECT
       COUNT(DISTINCT CASE WHEN e.device_type = 'mobile' THEN e.session_id END) AS mobile_sessions,
       COUNT(DISTINCT e.session_id) AS total_sessions
     FROM analytics_events e WHERE 1=1 ${where}`,
    params
  )
  const mobileSessions = Number(mobileResult.rows[0]?.mobile_sessions || 0)
  const totalSessions = Number(mobileResult.rows[0]?.total_sessions || 0)
  const mobileShare = totalSessions > 0 ? (mobileSessions / totalSessions) * 100 : 0

  const topCountryResult = await pool.query(
    `SELECT e.country_code, COUNT(DISTINCT e.session_id) AS cnt
     FROM analytics_events e
     WHERE e.country_code IS NOT NULL AND e.country_code <> 'unknown' ${where}
     GROUP BY e.country_code
     ORDER BY cnt DESC
     LIMIT 1`,
    params
  )

  return {
    totalPageViews,
    activeSessionsNow,
    mobileShare: Math.round(mobileShare * 10) / 10,
    topCountry: topCountryResult.rows[0]?.country_code || '—',
  }
}

export async function getTimeseries(filters, interval = 'auto') {
  const { where, params } = buildEventFilters(filters)
  const from = filters.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const to = filters.to || new Date().toISOString()

  let trunc = 'day'
  if (interval === 'hour') {
    trunc = 'hour'
  } else if (interval === 'auto') {
    const hoursRange = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60)
    trunc = hoursRange <= 48 ? 'hour' : 'day'
  }

  const result = await pool.query(
    `SELECT
       date_trunc($${params.length + 1}, e.occurred_at) AS bucket_start,
       COUNT(*) FILTER (WHERE e.event_type = 'page_view') AS page_views,
       COUNT(DISTINCT e.session_id) AS sessions
     FROM analytics_events e
     WHERE 1=1 ${where}
     GROUP BY date_trunc($${params.length + 1}, e.occurred_at)
     ORDER BY bucket_start`,
    [...params, trunc]
  )

  return result.rows.map((r) => ({
    bucketStart: r.bucket_start,
    pageViews: Number(r.page_views || 0),
    sessions: Number(r.sessions || 0),
  }))
}

export async function getRegionBreakdown(filters) {
  const { where, params } = buildEventFilters(filters)
  const totalResult = await pool.query(
    `SELECT COUNT(DISTINCT e.session_id) AS total FROM analytics_events e WHERE 1=1 ${where}`,
    params
  )
  const total = Number(totalResult.rows[0]?.total || 0)

  const result = await pool.query(
    `SELECT e.country_code AS "countryCode", COALESCE(e.region, '—') AS region,
       COUNT(DISTINCT e.session_id) AS count
     FROM analytics_events e
     WHERE e.country_code IS NOT NULL ${where}
     GROUP BY e.country_code, e.region
     ORDER BY count DESC`,
    params
  )

  return result.rows.map((r) => ({
    countryCode: r.countryCode || '—',
    region: r.region || '—',
    count: Number(r.count || 0),
    percentage: total > 0 ? Math.round((Number(r.count || 0) / total) * 1000) / 10 : 0,
  }))
}

export async function getDeviceBreakdown(filters) {
  const { where, params } = buildEventFilters(filters)
  const totalResult = await pool.query(
    `SELECT COUNT(DISTINCT e.session_id) AS total FROM analytics_events e WHERE 1=1 ${where}`,
    params
  )
  const total = Number(totalResult.rows[0]?.total || 0)

  const result = await pool.query(
    `SELECT COALESCE(e.device_type, 'unknown') AS "deviceType",
       COUNT(DISTINCT e.session_id) AS count
     FROM analytics_events e
     WHERE 1=1 ${where}
     GROUP BY e.device_type
     ORDER BY count DESC`,
    params
  )

  return result.rows.map((r) => ({
    deviceType: r.deviceType || 'unknown',
    count: Number(r.count || 0),
    percentage: total > 0 ? Math.round((Number(r.count || 0) / total) * 1000) / 10 : 0,
  }))
}

export async function getTopPages(filters, limit = 10) {
  const { where, params } = buildEventFilters(filters)
  const maxLimit = Math.min(Math.max(Number(limit) || 10, 1), 100)
  const result = await pool.query(
    `SELECT e.page_path AS "pagePath", COUNT(*) AS "pageViews"
     FROM analytics_events e
     WHERE e.event_type = 'page_view' ${where}
     GROUP BY e.page_path
     ORDER BY "pageViews" DESC
     LIMIT $${params.length + 1}`,
    [...params, maxLimit]
  )
  return result.rows.map((r) => ({
    pagePath: r.pagePath || '/',
    pageViews: Number(r.pageViews || 0),
  }))
}

export async function getActiveSessionsCount(siteId = null) {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  if (siteId) {
    const r = await pool.query(
      `SELECT COUNT(*) AS cnt FROM analytics_sessions
       WHERE last_seen_at >= $1 AND site_id = $2`,
      [fiveMinAgo, siteId]
    )
    return Number(r.rows[0]?.cnt || 0)
  }
  const r = await pool.query(
    `SELECT COUNT(*) AS cnt FROM analytics_sessions
     WHERE last_seen_at >= $1`,
    [fiveMinAgo]
  )
  return Number(r.rows[0]?.cnt || 0)
}
