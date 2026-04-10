import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token missing or invalid' })
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' })
  }
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function signStudentToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function requireAdmin(req, res, next) {
  const role = req.user?.role
  // Backward compatibility for older admin tokens that don't include role.
  if (!role || role === 'admin') {
    return next()
  }
  return res.status(403).json({ error: 'Acesso restrito ao administrador' })
}

export function requireStudent(req, res, next) {
  if (req.user?.role === 'student') {
    return next()
  }
  return res.status(403).json({ error: 'Acesso restrito ao aluno' })
}
