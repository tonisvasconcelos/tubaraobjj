import express from 'express'
import pool from '../db/pool.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { getPaymentProvider } from '../modules/payments/providerAdapter.js'

const router = express.Router()

async function upsertCustomer(client, customer) {
  const email = String(customer?.email || '').trim().toLowerCase()
  const name = String(customer?.name || '').trim()
  if (!email || !name) {
    throw new Error('Customer name and email are required')
  }

  const existing = await client.query('SELECT id FROM customers WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    await client.query('UPDATE customers SET name = $1, updated_at = NOW() WHERE id = $2', [name, existing.rows[0].id])
    return existing.rows[0].id
  }

  const created = await client.query(
    'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
    [name, email, customer?.phone ? String(customer.phone).trim().slice(0, 100) : null]
  )
  return created.rows[0].id
}

router.post('/session', rateLimit({ windowMs: 60_000, max: 15 }), async (req, res) => {
  const client = await pool.connect()
  try {
    const { items = [], customer = {}, metadata = {} } = req.body || {}
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens do checkout sao obrigatorios.' })
    }

    await client.query('BEGIN')
    const customerId = await upsertCustomer(client, customer)

    const normalizedItems = []
    for (const item of items) {
      const productId = Number(item.productId)
      const quantity = Math.max(1, Number(item.quantity || 1))
      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error('Produto invalido no checkout')
      }
      const productResult = await client.query(
        'SELECT id, name, price, is_published FROM products WHERE id = $1 LIMIT 1',
        [productId]
      )
      const product = productResult.rows[0]
      if (!product || product.is_published === false) {
        throw new Error('Produto indisponivel')
      }
      normalizedItems.push({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: Number(product.price),
      })
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, order_type, currency, subtotal, discount, total, status, provider, metadata)
       VALUES ($1, 'product', 'BRL', $2, 0, $3, 'pending', $4, $5)
       RETURNING id`,
      [customerId, subtotal, subtotal, process.env.PAYMENT_PROVIDER || 'mercadopago', metadata]
    )
    const orderId = orderResult.rows[0].id

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, item_type, product_id, quantity, unit_price, total_price)
         VALUES ($1, 'product', $2, $3, $4, $5)`,
        [orderId, item.productId, item.quantity, item.unitPrice, item.unitPrice * item.quantity]
      )
    }

    const { providerName, provider } = getPaymentProvider()
    const providerSession = await provider.createCheckoutSession({
      order: { id: orderId },
      customer,
      items: normalizedItems,
    })

    await client.query(
      `INSERT INTO payments (order_id, provider, provider_payment_id, method, amount, status, raw_payload)
       VALUES ($1, $2, $3, 'checkout', $4, 'pending', $5)`,
      [orderId, providerName, providerSession.providerReference || null, subtotal, providerSession.raw || {}]
    )

    await client.query(
      'UPDATE orders SET provider_order_id = $1, updated_at = NOW() WHERE id = $2',
      [providerSession.providerReference || null, orderId]
    )

    await client.query('COMMIT')
    return res.status(201).json({
      orderId,
      provider: providerName,
      checkoutUrl: providerSession.checkoutUrl,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[checkout/session]', error)
    return res.status(500).json({ error: error.message || 'Erro no checkout' })
  } finally {
    client.release()
  }
})

export default router
