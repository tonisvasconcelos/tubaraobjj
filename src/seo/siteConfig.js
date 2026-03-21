/**
 * Canonical site origin for SEO (Open Graph, JSON-LD, sitemap alignment).
 * Override in Vercel: VITE_SITE_URL=https://www.tubaraobjj.com
 */
export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://www.tubaraobjj.com').replace(
  /\/$/,
  ''
)

export const SITE_NAME_SHORT = 'GFTeam Tubarão'

export const DEFAULT_OG_IMAGE_PATH = '/images/20397a70-3e6a-4a70-a2cd-e6ad51a59c6e.png'

/** Router basename (e.g. '' or '/tubaraobjj') for canonical URLs */
export function routerBasePath() {
  const raw = import.meta.env.BASE_URL || '/'
  if (raw === '/') return ''
  return String(raw).replace(/\/$/, '')
}

/** Absolute URL for a path served from /public */
export function absolutePublicUrl(pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const base = routerBasePath()
  return `${SITE_ORIGIN}${base}${path}`
}

/** Canonical URL for a router pathname (respects Vite BASE_URL). */
export function canonicalUrlForPathname(pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const basePrefix = routerBasePath()
  return `${SITE_ORIGIN}${basePrefix}${path}`
}
