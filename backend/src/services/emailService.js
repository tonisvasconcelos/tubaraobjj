import { Resend } from 'resend'

function sanitizeEmail(value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : ''
}

function buildFromHeader({ businessName }) {
  const fromEmail = sanitizeEmail(process.env.RESEND_FROM_EMAIL)
  if (!fromEmail) return ''
  const configuredName = String(process.env.RESEND_FROM_NAME || '').trim()
  const senderName = configuredName || String(businessName || '').trim() || 'GFTeam Tubarao'
  return `${senderName} <${fromEmail}>`
}

function getResendClient() {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendEmail({ to, subject, text, html, businessName, idempotencyKey }) {
  const recipient = sanitizeEmail(to)
  if (!recipient) throw new Error('Destinatário de e-mail inválido')
  if (!String(subject || '').trim()) throw new Error('Assunto do e-mail é obrigatório')
  if (!String(text || '').trim() && !String(html || '').trim()) {
    throw new Error('Texto ou HTML do e-mail é obrigatório')
  }

  const resend = getResendClient()
  if (!resend) throw new Error('RESEND_API_KEY não configurada')

  const from = buildFromHeader({ businessName })
  if (!from) throw new Error('RESEND_FROM_EMAIL não configurado')

  const payload = {
    from,
    to: [recipient],
    subject: String(subject).trim().slice(0, 255),
    text: String(text || '').trim() || undefined,
    html: String(html || '').trim() || undefined,
    replyTo: sanitizeEmail(process.env.RESEND_REPLY_TO) || undefined,
  }
  if (idempotencyKey) payload.headers = { 'Idempotency-Key': String(idempotencyKey).slice(0, 200) }

  const { data, error } = await resend.emails.send(payload)
  if (error) {
    const err = new Error(error.message || 'Falha ao enviar e-mail com Resend')
    err.code = 'RESEND_API_ERROR'
    err.resendError = error
    throw err
  }
  return data
}

export async function loadAcademySettings(client) {
  const settings = await client.query(
    `SELECT business_name, main_contact_email
     FROM academy_settings
     ORDER BY id ASC
     LIMIT 1`
  )
  return settings.rows[0] || { business_name: '', main_contact_email: '' }
}

export { sanitizeEmail }
