import express from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import pool from '../db/pool.js'
import { signToken } from '../middleware/auth.js'

const router = express.Router()

router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { email, password } = req.body
      const r = await pool.query(
        'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
        [email]
      )
      if (r.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }
      const user = r.rows[0]
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }
      const token = signToken({ id: user.id, email: user.email })
      return res.json({ token, user: { id: user.id, email: user.email } })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro no servidor' })
    }
  }
)

export default router
