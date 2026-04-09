import express from 'express'
import pool from '../db/pool.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description, price, billing_cycle, trial_days
       FROM plans
       WHERE is_active = true
       ORDER BY sort_order ASC, id ASC`
    )
    return res.json(result.rows)
  } catch (error) {
    console.error('[plans/list]', error)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router
