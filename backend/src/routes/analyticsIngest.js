import express from 'express'
import * as analyticsDb from '../db/analytics.js'
import { getClientIp, getGeoFromIp } from '../lib/analyticsGeo.js'
import { isBot } from '../lib/analyticsBot.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = express.Router()

const VALID_EVENT_TYPES = new Set(['page_view', 'session_start', 'heartbeat', 'session_end'])

function parseUserAgentFamily(ua) {
  const u = String(ua || '').toLowerCase()
  if (u.includes('chrome') && !u.includes('edg')) return 'Chrome'
  if (u.includes('safari') && !u.includes('chrome')) return 'Safari'
  if (u.includes('firefox')) return 'Firefox'
  if (u.includes('edg')) return 'Edge'
  return null
}

function detectAllowedOrigin(origin) {
  const env = process.env.ANALYTICS_INGEST_ALLOWED_ORIGINS || ''
  const configured = env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (configured.length === 0) {
    return (
      origin.includes('tubaraobjj.com') ||
      origin.includes('.vercel.app') ||
      origin.includes('localhost:5173') ||
      origin.includes('localhost:5174')
    )
  }
  return configured.includes(origin)
}

function ingestCorsGuard(req, res, next) {
  const origin = req.headers.origin
  if (!origin) return next()
  if (!detectAllowedOrigin(String(origin))) {
    return res.status(403).json({ error: 'Origem não autorizada para ingest analytics' })
  }
  return next()
}

router.post('/ingest', rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.ANALYTICS_INGEST_RATE_MAX || 300) }), ingestCorsGuard, async (req, res) => {
  try {
    const body = req.body || {}
    const eventType = String(body.eventType || '').trim()
    const sessionId = String(body.sessionId || '').trim()

    if (!VALID_EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ error: 'eventType inválido' })
    }
    if (!sessionId || sessionId.length > 255) {
      return res.status(400).json({ error: 'sessionId inválido' })
    }

    const occurred = body.occurredAt ? new Date(body.occurredAt) : new Date()
    if (Number.isNaN(occurred.getTime())) {
      return res.status(400).json({ error: 'occurredAt inválido' })
    }

    const pagePath = body.pagePath ? String(body.pagePath) : ''
    if (!pagePath && eventType !== 'session_end') {
      return res.status(400).json({ error: 'pagePath é obrigatório para este evento' })
    }

    const ua = String(body.userAgent || req.headers['user-agent'] || '')
    const bot = isBot(ua)
    const geo = await getGeoFromIp(getClientIp(req))

    const eventRow = {
      eventType,
      occurredAt: occurred.toISOString(),
      siteId: body.siteId ? String(body.siteId).trim() : 'default',
      sessionId,
      userId: body.userId ? String(body.userId).trim() : null,
      pagePath,
      referrer: body.referrer ? String(body.referrer).trim() : null,
      deviceType: body.deviceType ? String(body.deviceType).trim() : null,
      userAgentFamily: parseUserAgentFamily(ua),
      countryCode: geo.countryCode,
      region: geo.region,
      city: geo.city,
      timezone: body.timezone ? String(body.timezone).trim() : null,
      isBot: bot,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : null,
    }

    await analyticsDb.insertEvent(eventRow)

    if (eventType === 'session_start' || eventType === 'heartbeat' || eventType === 'page_view') {
      await analyticsDb.upsertSession({
        sessionId,
        siteId: eventRow.siteId,
        startedAt: eventRow.occurredAt,
        lastSeenAt: eventRow.occurredAt,
        deviceType: eventRow.deviceType,
        countryCode: eventRow.countryCode,
        region: eventRow.region,
        userId: eventRow.userId,
      })
    }

    if (eventType === 'session_end') {
      await analyticsDb.endSession(sessionId, eventRow.occurredAt)
    }

    res.status(202).json({ ok: true })
  } catch (error) {
    console.error('[analytics-ingest]', error)
    res.status(500).json({ error: 'Falha no ingest de analytics' })
  }
})

export default router
