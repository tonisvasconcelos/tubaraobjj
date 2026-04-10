const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

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

export async function getPlans() {
  try {
    return await get('/api/plans')
  } catch {
    return []
  }
}
