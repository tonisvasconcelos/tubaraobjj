import { mercadoPagoProvider } from './providers/mercadoPagoProvider.js'

const providers = {
  mercadopago: mercadoPagoProvider,
}

export function getPaymentProvider() {
  const providerName = String(process.env.PAYMENT_PROVIDER || 'mercadopago').toLowerCase()
  const provider = providers[providerName]
  if (!provider) {
    throw new Error(`Unsupported payment provider: ${providerName}`)
  }
  return { providerName, provider }
}
