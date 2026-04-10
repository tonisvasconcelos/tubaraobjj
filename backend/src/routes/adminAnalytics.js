import express from 'express'
import { authMiddleware, requireAdmin } from '../middleware/auth.js'
import * as analyticsDb from '../db/analytics.js'

const router = express.Router()
router.use(authMiddleware, requireAdmin)

function parseFilters(req) {
  const from = req.query.from ? String(req.query.from).trim() : null
  const to = req.query.to ? String(req.query.to).trim() : null
  const siteId = req.query.siteId ? String(req.query.siteId).trim() : null
  const countryCode = req.query.countryCode ? String(req.query.countryCode).trim() : null
  const deviceType = req.query.deviceType ? String(req.query.deviceType).trim() : null
  const excludeBots = req.query.excludeBots !== 'false'

  let fromDate = from ? new Date(from) : null
  let toDate = to ? new Date(to) : null
  if (!fromDate || Number.isNaN(fromDate.getTime())) fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  if (!toDate || Number.isNaN(toDate.getTime())) toDate = new Date()

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    siteId: siteId || null,
    countryCode: countryCode || null,
    deviceType: deviceType || null,
    excludeBots,
  }
}

router.get('/analytics/overview', async (req, res) => {
  try {
    res.json(await analyticsDb.getOverview(parseFilters(req)))
  } catch (error) {
    console.error('[admin-analytics/overview]', error)
    res.status(500).json({ error: 'Falha ao carregar visão geral de analytics' })
  }
})

router.get('/analytics/active-now', async (req, res) => {
  try {
    const siteId = req.query.siteId ? String(req.query.siteId).trim() : null
    const count = await analyticsDb.getActiveSessionsCount(siteId)
    res.json({ activeSessionsNow: count })
  } catch (error) {
    console.error('[admin-analytics/active-now]', error)
    res.status(500).json({ error: 'Falha ao carregar sessões ativas' })
  }
})

router.get('/analytics/timeseries', async (req, res) => {
  try {
    const filters = parseFilters(req)
    const interval = (req.query.interval || 'auto').toString().toLowerCase()
    const validInterval = ['auto', 'hour', 'day'].includes(interval) ? interval : 'auto'
    res.json(await analyticsDb.getTimeseries(filters, validInterval))
  } catch (error) {
    console.error('[admin-analytics/timeseries]', error)
    res.status(500).json({ error: 'Falha ao carregar série temporal' })
  }
})

router.get('/analytics/breakdowns/region', async (req, res) => {
  try {
    res.json(await analyticsDb.getRegionBreakdown(parseFilters(req)))
  } catch (error) {
    console.error('[admin-analytics/breakdowns/region]', error)
    res.status(500).json({ error: 'Falha ao carregar breakdown por região' })
  }
})

router.get('/analytics/breakdowns/device', async (req, res) => {
  try {
    res.json(await analyticsDb.getDeviceBreakdown(parseFilters(req)))
  } catch (error) {
    console.error('[admin-analytics/breakdowns/device]', error)
    res.status(500).json({ error: 'Falha ao carregar breakdown por dispositivo' })
  }
})

router.get('/analytics/breakdowns/pages', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100)
    res.json(await analyticsDb.getTopPages(parseFilters(req), limit))
  } catch (error) {
    console.error('[admin-analytics/breakdowns/pages]', error)
    res.status(500).json({ error: 'Falha ao carregar páginas mais acessadas' })
  }
})

export default router
