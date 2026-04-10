const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
const INGEST_URL = `${API_URL}/api/analytics/ingest`
const HEARTBEAT_MS = 30_000
const SESSION_KEY = 'tbj_analytics_session_id'

let heartbeatTimer = null
let lastPath = '/'
let sessionStarted = false

function nowIso() {
  return new Date().toISOString()
}

function getOrCreateSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const next = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tbj-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(SESSION_KEY, next)
  return next
}

function detectDeviceType() {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth || 1280
  if (width <= 767) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}

function postEvent(payload) {
  const body = JSON.stringify(payload)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    const ok = navigator.sendBeacon(INGEST_URL, blob)
    if (ok) return
  }
  fetch(INGEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

export function sendAnalyticsEvent(eventType, extra = {}) {
  if (typeof window === 'undefined') return
  const payload = {
    eventType,
    occurredAt: nowIso(),
    siteId: import.meta.env.VITE_ANALYTICS_SITE_ID || 'default',
    sessionId: getOrCreateSessionId(),
    pagePath: extra.pagePath || `${window.location.pathname}${window.location.search || ''}`,
    referrer: document.referrer || null,
    deviceType: detectDeviceType(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    userAgent: navigator.userAgent || null,
    metadata: extra.metadata || null,
  }
  postEvent(payload)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function startHeartbeat() {
  stopHeartbeat()
  heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      sendAnalyticsEvent('heartbeat', { pagePath: lastPath })
    }
  }, HEARTBEAT_MS)
}

export function initAnalyticsSession() {
  if (typeof window === 'undefined' || sessionStarted) return
  sessionStarted = true
  sendAnalyticsEvent('session_start')
  startHeartbeat()
  window.addEventListener('beforeunload', () => {
    sendAnalyticsEvent('session_end', { pagePath: lastPath })
  })
}

export function trackAnalyticsPageView(pathname) {
  if (typeof window === 'undefined') return
  lastPath = pathname || `${window.location.pathname}${window.location.search || ''}`
  sendAnalyticsEvent('page_view', { pagePath: lastPath })
}
