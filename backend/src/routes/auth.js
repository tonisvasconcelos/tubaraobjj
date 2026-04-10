import express from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import pool from '../db/pool.js'
import { signStudentToken, signToken } from '../middleware/auth.js'

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
      const token = signToken({ id: user.id, email: user.email, role: 'admin' })
      return res.json({ token, user: { id: user.id, email: user.email, role: 'admin' } })
    } catch (e) {
      console.error('[auth/login]', e?.message || e)
      return res.status(500).json({ error: 'Erro no servidor' })
    }
  }
)

router.post(
  '/student/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { email, password } = req.body
      const result = await pool.query(
        `SELECT id, email, name, password_hash, status
         FROM students
         WHERE email = $1`,
        [email]
      )
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }
      const student = result.rows[0]
      if (student.status !== 'active') {
        return res.status(403).json({ error: 'Aluno inativo. Fale com a secretaria.' })
      }
      const ok = await bcrypt.compare(password, student.password_hash || '')
      if (!ok) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      const token = signStudentToken({
        role: 'student',
        studentId: student.id,
        email: student.email,
      })
      return res.json({
        token,
        student: { id: student.id, name: student.name, email: student.email, status: student.status },
      })
    } catch (e) {
      console.error('[auth/student/login]', e?.message || e)
      return res.status(500).json({ error: 'Erro no servidor' })
    }
  }
)

export default router
