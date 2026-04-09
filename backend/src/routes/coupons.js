import express from 'express'
import pool from '../db/pool.js'

const router = express.Router()

router.post('/validate', async (req, res) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase()
    if (!code) {
      return res.status(400).json({ error: 'Código é obrigatório' })
    }

    const result = await pool.query(
      `SELECT code, type, value, min_order_amount, max_uses, used_count, expires_at, is_active
       FROM coupons
       WHERE code = $1
       LIMIT 1`,
      [code]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'Cupom não encontrado' })
    }

    const coupon = result.rows[0]
    const now = new Date()
    const expired = coupon.expires_at ? new Date(coupon.expires_at) < now : false
    const maxed = coupon.max_uses != null && coupon.used_count >= coupon.max_uses
    const valid = coupon.is_active && !expired && !maxed

    return res.json({
      valid,
      coupon: valid
        ? {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrderAmount: coupon.min_order_amount,
          }
        : null,
      error: valid ? null : 'Cupom inválido ou expirado',
    })
  } catch (error) {
    console.error('[coupons/validate]', error)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router
