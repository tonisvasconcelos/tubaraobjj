const MP_API_BASE = 'https://api.mercadopago.com'

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    throw new Error('MP_ACCESS_TOKEN is required')
  }
  return token
}

function getAppBaseUrl() {
  return (process.env.APP_PUBLIC_URL || 'https://www.tubaraobjj.com').replace(/\/$/, '')
}

export const mercadoPagoProvider = {
  async createCheckoutSession({ order, items, customer }) {
    const accessToken = getAccessToken()
    const base = getAppBaseUrl()
    const payload = {
      items: items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: Number(item.unitPrice),
      })),
      payer: {
        name: customer.name,
        email: customer.email,
      },
      external_reference: String(order.id),
      payment_methods: {
        excluded_payment_types: [],
      },
      back_urls: {
        success: `${base}/store?checkout=success`,
        failure: `${base}/store?checkout=failure`,
        pending: `${base}/store?checkout=pending`,
      },
      auto_return: 'approved',
      notification_url: `${(process.env.API_PUBLIC_URL || '').replace(/\/$/, '')}/api/payments/webhook`,
    }

    const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || 'Mercado Pago preference creation failed')
    }
    return {
      providerReference: data.id,
      checkoutUrl: data.init_point || data.sandbox_init_point || null,
      raw: data,
    }
  },

  async getPaymentById(paymentId) {
    const accessToken = getAccessToken()
    const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || 'Mercado Pago payment fetch failed')
    }
    return data
  },
}
