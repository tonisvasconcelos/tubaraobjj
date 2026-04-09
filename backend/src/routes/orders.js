import express from 'express'
import pool from '../db/pool.js'

const router = express.Router()

router.get('/:id', async (req, res) => {
  try {
    const orderId = Number(req.params.id)
    const email = String(req.query.email || '').trim().toLowerCase()
    if (!Number.isInteger(orderId) || orderId <= 0 || !email) {
      return res.status(400).json({ error: 'Parâmetros inválidos' })
    }

    const orderResult = await pool.query(
      `SELECT o.id, o.order_type, o.currency, o.total, o.status, o.created_at, c.email
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1 AND c.email = $2
       LIMIT 1`,
      [orderId, email]
    )
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    const itemsResult = await pool.query(
      `SELECT id, item_type, product_id, plan_id, quantity, unit_price, total_price
       FROM order_items
       WHERE order_id = $1`,
      [orderId]
    )

    return res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
    })
  } catch (error) {
    console.error('[orders/get]', error)
    return res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router
