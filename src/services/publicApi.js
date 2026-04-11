const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
const VISITOR_STORAGE_KEY = 'tubarao-visitor-id'

async function get(path) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getTeamMembers() {
  try {
    return await get('/api/team-members')
  } catch {
    return []
  }
}

export async function getBranches() {
  try {
    return await get('/api/branches')
  } catch {
    return []
  }
}

export async function getProducts() {
  try {
    return await get('/api/products')
  } catch {
    return []
  }
}

export async function getHighlights() {
  try {
    return await get('/api/highlights')
  } catch {
    return []
  }
}

export async function getSchedules() {
  try {
    return await get('/api/schedules')
  } catch {
    return []
  }
}

export function getOrCreateVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
  } catch {
    // ignore storage errors
  }
  const generated =
    globalThis.crypto?.randomUUID?.() ||
    `visitor_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
  try {
    localStorage.setItem(VISITOR_STORAGE_KEY, generated)
  } catch {
    // ignore storage errors
  }
  return generated
}

export async function submitContact(data) {
  const res = await fetch(`${API_URL}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Falha ao enviar')
  return result
}

export async function submitTrialLead(data) {
  const res = await fetch(`${API_URL}/api/leads/trial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Falha ao enviar')
  return result
}

export async function getTrialSlots(params = {}) {
  const query = new URLSearchParams()
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.branch_id) query.set('branch_id', String(params.branch_id))
  if (params.class_type) query.set('class_type', String(params.class_type))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  try {
    return await get(`/api/trial/slots${suffix}`)
  } catch {
    return []
  }
}

export async function createTrialReservation(data) {
  const res = await fetch(`${API_URL}/api/trial/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Falha ao reservar aula experimental')
  return result
}

export async function createTrialPrivateRequest(data) {
  const res = await fetch(`${API_URL}/api/trial/private-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Falha ao enviar solicitação de aula privada')
  return result
}

export async function createCheckoutSession(data) {
  const res = await fetch(`${API_URL}/api/checkout/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Falha ao iniciar checkout')
  return result
}

export async function getActiveLegalTerms(locale = 'pt-BR') {
  try {
    return await get(`/api/legal/active?locale=${encodeURIComponent(locale)}`)
  } catch {
    return []
  }
}

export async function recordLegalAgreement(data) {
  const res = await fetch(`${API_URL}/api/legal/agreements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(result.error || 'Falha ao registrar aceite legal')
  return result
}

export async function getActiveMedicalQuestionnaire() {
  try {
    return await get('/api/medical-questionnaire/active')
  } catch {
    return { template: null, questions: [] }
  }
}

export async function getPlans() {
  try {
    return await get('/api/plans')
  } catch {
    return []
  }
}
