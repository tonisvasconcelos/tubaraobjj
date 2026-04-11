import pool from '../db/pool.js'
import { loadAcademySettings, sanitizeEmail, sendEmail } from './emailService.js'

function formatDateTime(value) {
  if (!value) return 'N/A'
  try {
    return new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  } catch {
    return String(value)
  }
}

function buildEmailContent({ kind, data, academyName }) {
  const title =
    kind === 'reservation'
      ? 'Novo agendamento de aula experimental'
      : 'Nova solicitação de aula experimental privada'

  const lines = [
    title,
    '',
    `Unidade: ${data.branchName || 'N/A'}`,
    `Nome: ${data.name || 'N/A'}`,
    `Email: ${data.email || 'N/A'}`,
    `Telefone: ${data.phone || 'N/A'}`,
    `Tipo: ${kind === 'reservation' ? 'Aula em grupo' : 'Aula privada'}`,
    `Horário solicitado: ${data.startsAt ? formatDateTime(data.startsAt) : 'N/A'}`,
    data.endsAt ? `Fim: ${formatDateTime(data.endsAt)}` : null,
    data.instructorName ? `Professor: ${data.instructorName}` : null,
    data.notes ? `Observações: ${data.notes}` : null,
  ].filter(Boolean)

  const text = lines.join('\n')
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.55;">
      <h2 style="margin: 0 0 12px;">${title}</h2>
      <p style="margin: 0 0 12px;">${academyName || 'GFTeam Tubarao'}</p>
      <ul style="padding-left: 16px; margin: 0;">
        <li><strong>Unidade:</strong> ${data.branchName || 'N/A'}</li>
        <li><strong>Nome:</strong> ${data.name || 'N/A'}</li>
        <li><strong>Email:</strong> ${data.email || 'N/A'}</li>
        <li><strong>Telefone:</strong> ${data.phone || 'N/A'}</li>
        <li><strong>Tipo:</strong> ${kind === 'reservation' ? 'Aula em grupo' : 'Aula privada'}</li>
        <li><strong>Horário solicitado:</strong> ${data.startsAt ? formatDateTime(data.startsAt) : 'N/A'}</li>
        ${data.endsAt ? `<li><strong>Fim:</strong> ${formatDateTime(data.endsAt)}</li>` : ''}
        ${data.instructorName ? `<li><strong>Professor:</strong> ${data.instructorName}</li>` : ''}
        ${data.notes ? `<li><strong>Observações:</strong> ${data.notes}</li>` : ''}
      </ul>
    </div>
  `.trim()

  return { title, text, html }
}

export async function notifyTrialBooking(kind, payload) {
  const client = await pool.connect()
  try {
    const settings = await loadAcademySettings(client)
    const academyName = String(settings.business_name || '').trim()
    const mainEmail = sanitizeEmail(settings.main_contact_email)
    const teacherEmail = sanitizeEmail(payload.instructorEmail)
    const content = buildEmailContent({ kind, data: payload, academyName })

    const jobs = []
    if (mainEmail) {
      jobs.push(
        sendEmail({
          to: mainEmail,
          subject: content.title,
          text: content.text,
          html: content.html,
          businessName: academyName,
          idempotencyKey: `trial-${kind}-academy-${payload.eventId}`,
        })
      )
    } else {
      console.warn(`[trial-notification/${kind}] main_contact_email não configurado`)
    }

    if (teacherEmail) {
      jobs.push(
        sendEmail({
          to: teacherEmail,
          subject: content.title,
          text: content.text,
          html: content.html,
          businessName: academyName,
          idempotencyKey: `trial-${kind}-teacher-${payload.eventId}`,
        })
      )
    }

    if (jobs.length > 0) await Promise.all(jobs)
  } finally {
    client.release()
  }
}
