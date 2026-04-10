const BOT_UA_SUBSTRINGS = [
  'bot',
  'crawler',
  'spider',
  'slurp',
  'googlebot',
  'bingbot',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'curl',
  'wget',
  'python-requests',
  'axios',
  'headless',
  'phantom',
  'selenium',
  'puppeteer',
  'prerender',
]

export function isBot(userAgent) {
  const ua = String(userAgent || '').toLowerCase()
  if (!ua.trim()) return true
  return BOT_UA_SUBSTRINGS.some((s) => ua.includes(s))
}
