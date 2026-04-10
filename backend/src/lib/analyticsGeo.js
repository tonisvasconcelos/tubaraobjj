export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const first = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]
    return (first || '').trim() || req.ip || req.socket?.remoteAddress || ''
  }
  return req.ip || req.socket?.remoteAddress || ''
}

export async function getGeoFromIp(ip) {
  const fallback = { countryCode: 'unknown', region: 'unknown', city: 'unknown' }
  if (!ip || ip === '::1' || ip === '127.0.0.1') return fallback

  const provider = (process.env.GEOIP_PROVIDER || 'ip-api').toLowerCase()
  const apiKey = process.env.GEOIP_API_KEY

  try {
    if (provider === 'ip-api') {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,regionName,city`,
        { signal: AbortSignal.timeout(3000) }
      )
      const data = await res.json()
      if (data?.status === 'success') {
        return {
          countryCode: data.countryCode || 'unknown',
          region: data.regionName || 'unknown',
          city: data.city || 'unknown',
        }
      }
      return fallback
    }

    if (provider === 'ipinfo' && apiKey) {
      const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}?token=${apiKey}`, {
        signal: AbortSignal.timeout(3000),
      })
      const data = await res.json()
      if (data?.country) {
        return {
          countryCode: data.country || 'unknown',
          region: data.region || 'unknown',
          city: data.city || 'unknown',
        }
      }
    }
  } catch (_error) {
    return fallback
  }

  return fallback
}
