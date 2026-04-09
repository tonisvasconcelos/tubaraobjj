const buckets = new Map()

function now() {
  return Date.now()
}

function keyFor(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown'
  return `${ip}:${req.path}`
}

export function rateLimit({ windowMs = 60_000, max = 30 } = {}) {
  return (req, res, next) => {
    const key = keyFor(req)
    const timestamp = now()
    const bucket = buckets.get(key) || { count: 0, expiresAt: timestamp + windowMs }

    if (timestamp > bucket.expiresAt) {
      bucket.count = 0
      bucket.expiresAt = timestamp + windowMs
    }

    bucket.count += 1
    buckets.set(key, bucket)

    if (bucket.count > max) {
      return res.status(429).json({ error: 'Muitas requisicoes, tente novamente em instantes.' })
    }

    next()
  }
}
