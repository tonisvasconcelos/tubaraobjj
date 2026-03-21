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
