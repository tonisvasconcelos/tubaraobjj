const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

function getToken() {
  return localStorage.getItem('adminToken')
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Falha no login')
  return data
}

export function authFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  return fetch(`${API_URL}${path}`, { ...options, headers })
}

export async function uploadFile(file) {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/api/admin/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Falha no upload')
  return data.url
}

// CRUD helpers
export const admin = {
  team: {
    list: () => authFetch('/api/admin/team-members').then((r) => r.json()),
    create: (body) => authFetch('/api/admin/team-members', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
    update: (id, body) => authFetch(`/api/admin/team-members/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
    delete: (id) => authFetch(`/api/admin/team-members/${id}`, { method: 'DELETE' }),
  },
  branches: {
    list: () => authFetch('/api/admin/branches').then((r) => r.json()),
    create: (body) => authFetch('/api/admin/branches', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
    update: (id, body) => authFetch(`/api/admin/branches/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
    delete: (id) => authFetch(`/api/admin/branches/${id}`, { method: 'DELETE' }),
  },
  products: {
    list: () => authFetch('/api/admin/products').then((r) => r.json()),
    create: (body) => authFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
    update: (id, body) => authFetch(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
    delete: (id) => authFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
  },
  contacts: {
    list: () => authFetch('/api/admin/contacts').then((r) => r.json()),
    markRead: (id) => authFetch(`/api/admin/contacts/${id}/read`, { method: 'PATCH' }).then((r) => r.json()),
  },
  highlights: {
    list: () => authFetch('/api/admin/highlights').then((r) => r.json()),
    create: (body) => authFetch('/api/admin/highlights', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
    update: (id, body) => authFetch(`/api/admin/highlights/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
    delete: (id) => authFetch(`/api/admin/highlights/${id}`, { method: 'DELETE' }),
  },
  schedules: {
    list: async () => {
      const r = await authFetch('/api/admin/schedules')
      const data = await r.json().catch(() => [])
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar horários')
      return Array.isArray(data) ? data : []
    },
    create: async (body) => {
      const r = await authFetch('/api/admin/schedules', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar')
      return data
    },
    update: async (id, body) => {
      const r = await authFetch(`/api/admin/schedules/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar')
      return data
    },
    delete: async (id) => {
      const r = await authFetch(`/api/admin/schedules/${id}`, { method: 'DELETE' })
      if (r.status === 204) return
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao remover')
    },
  },
}
