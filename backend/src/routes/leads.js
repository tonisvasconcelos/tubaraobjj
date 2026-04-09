import express from 'express'
import pool from '../db/pool.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = express.Router()

router.post('/trial', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  try {
    const { name, email, phone, interestProgram, preferredTime, notes } = req.body || {}
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Nome, email e telefone sao obrigatorios.' })
    }

    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, interest_program, preferred_time, notes, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [
        String(name).trim().slice(0, 255),
        String(email).trim().toLowerCase().slice(0, 255),
        String(phone).trim().slice(0, 100),
        interestProgram ? String(interestProgram).trim().slice(0, 120) : null,
        preferredTime ? String(preferredTime).trim().slice(0, 120) : null,
        notes ? String(notes).trim().slice(0, 4000) : null,
        'website_trial',
        'new',
      ]
    )

    return res.status(201).json({
      message: 'Lead de aula experimental registrado com sucesso.',
      leadId: result.rows[0].id,
    })
  } catch (error) {
    console.error('[leads/trial]', error)
    return res.status(500).json({ error: 'Erro no servidor.' })
  }
})

export default router
