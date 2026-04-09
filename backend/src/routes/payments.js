import express from 'express'
import pool from '../db/pool.js'
import { getPaymentProvider } from '../modules/payments/providerAdapter.js'

const router = express.Router()

function mapMercadoPagoStatus(status) {
  if (status === 'approved') return { paymentStatus: 'approved', orderStatus: 'paid' }
  if (status === 'pending' || status === 'in_process') return { paymentStatus: 'pending', orderStatus: 'pending' }
  if (status === 'cancelled' || status === 'rejected') return { paymentStatus: 'failed', orderStatus: 'failed' }
  return { paymentStatus: 'pending', orderStatus: 'pending' }
}

router.post('/webhook', async (req, res) => {
  const payload = req.body || {}
  const topic = payload.type || payload.topic
  const resourceId = payload.data?.id || payload['data.id']
  const eventId = payload.id || `${topic || 'unknown'}:${resourceId || Date.now()}`
  const provider = String(process.env.PAYMENT_PROVIDER || 'mercadopago').toLowerCase()

  try {
    await pool.query(
      `INSERT INTO webhook_events (provider, event_id, event_type, payload, status)
       VALUES ($1, $2, $3, $4, 'received')
       ON CONFLICT (provider, event_id) DO NOTHING`,
      [provider, String(eventId), String(topic || 'unknown'), payload]
    )

    if (topic !== 'payment' || !resourceId) {
      return res.status(202).json({ ok: true, ignored: true })
    }

    const { provider: paymentProvider } = getPaymentProvider()
    const payment = await paymentProvider.getPaymentById(resourceId)
    const orderId = Number(payment.external_reference)
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(202).json({ ok: true, ignored: true })
    }

    const mapped = mapMercadoPagoStatus(payment.status)
    await pool.query(
      `UPDATE payments
       SET provider_payment_id = $1, status = $2, method = COALESCE($3, method), paid_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE paid_at END, raw_payload = $4, updated_at = NOW()
       WHERE order_id = $5`,
      [String(payment.id), mapped.paymentStatus, payment.payment_method_id || null, payment, orderId]
    )
    await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [mapped.orderStatus, orderId]
    )
    await pool.query(
      `UPDATE webhook_events
       SET status = 'processed', processed_at = NOW()
       WHERE provider = $1 AND event_id = $2`,
      [provider, String(eventId)]
    )

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[payments/webhook]', error)
    await pool.query(
      `UPDATE webhook_events
       SET status = 'failed', error_message = $3, processed_at = NOW()
       WHERE provider = $1 AND event_id = $2`,
      [provider, String(eventId), String(error.message || 'webhook_failed').slice(0, 500)]
    )
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
