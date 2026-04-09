import express from 'express'
import pool from '../db/pool.js'

const router = express.Router()

router.get('/portal', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase()
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const result = await pool.query(
      `SELECT s.id, s.status, s.current_period_start, s.current_period_end, p.name AS plan_name, p.price
       FROM subscriptions s
       JOIN customers c ON c.id = s.customer_id
       JOIN plans p ON p.id = s.plan_id
       WHERE c.email = $1
       ORDER BY s.created_at DESC`,
      [email]
    )
    return res.json(result.rows)
  } catch (error) {
    console.error('[subscriptions/portal]', error)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router
