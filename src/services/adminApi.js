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
  students: {
    list: () => authFetch('/api/admin/students').then((r) => r.json()),
    create: (body) => authFetch('/api/admin/students', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
    update: (id, body) => authFetch(`/api/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.json()),
    delete: (id) => authFetch(`/api/admin/students/${id}`, { method: 'DELETE' }),
    resetPassword: async (id, password) => {
      const r = await authFetch(`/api/admin/students/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao redefinir senha')
      return data
    },
  },
  plans: {
    list: () => authFetch('/api/admin/plans').then((r) => r.json()),
    create: async (body) => {
      const r = await authFetch('/api/admin/plans', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar plano')
      return data
    },
    update: async (id, body) => {
      const r = await authFetch(`/api/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar plano')
      return data
    },
    delete: async (id) => {
      const r = await authFetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
      if (r.status === 204) return
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao remover plano')
    },
  },
  assignments: {
    list: (studentId) => {
      const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : ''
      return authFetch(`/api/admin/plan-assignments${query}`).then((r) => r.json())
    },
    create: async (body) => {
      const r = await authFetch('/api/admin/plan-assignments', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar vínculo')
      return data
    },
    update: async (id, body) => {
      const r = await authFetch(`/api/admin/plan-assignments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar vínculo')
      return data
    },
  },
  trial: {
    listSlots: () => authFetch('/api/admin/trial-slots').then((r) => r.json()),
    createSlot: async (body) => {
      const r = await authFetch('/api/admin/trial-slots', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar horário')
      return data
    },
    createSlotsBulk: async (body) => {
      const r = await authFetch('/api/admin/trial-slots/bulk', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        const error = new Error(data.error || 'Erro ao criar série de horários')
        error.status = r.status
        throw error
      }
      return data
    },
    updateSlot: async (id, body) => {
      const r = await authFetch(`/api/admin/trial-slots/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar horário')
      return data
    },
    deleteSlot: async (id) => {
      const r = await authFetch(`/api/admin/trial-slots/${id}`, { method: 'DELETE' })
      if (r.status === 204) return
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao remover horário')
    },
    deleteAllSlots: async () => {
      const r = await authFetch('/api/admin/trial-slots/all', { method: 'DELETE' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao remover todos os horários')
      return data
    },
    listReservations: () => authFetch('/api/admin/trial-reservations').then((r) => r.json()),
    updateReservation: async (id, body) => {
      const r = await authFetch(`/api/admin/trial-reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar reserva')
      return data
    },
    listLeads: () => authFetch('/api/admin/leads').then((r) => r.json()),
    updateLead: async (id, body) => {
      const r = await authFetch(`/api/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar lead')
      return data
    },
  },
  websiteTerms: {
    list: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/website-terms${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => [])
      if (!r.ok) throw new Error(data.error || 'Erro ao listar termos do site')
      return Array.isArray(data) ? data : []
    },
    create: async (body) => {
      const r = await authFetch('/api/admin/website-terms', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar termo do site')
      return data
    },
    update: async (id, body) => {
      const r = await authFetch(`/api/admin/website-terms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar termo do site')
      return data
    },
    publish: async (id) => {
      const r = await authFetch(`/api/admin/website-terms/${id}/publish`, { method: 'PATCH' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao publicar termo do site')
      return data
    },
    delete: async (id) => {
      const r = await authFetch(`/api/admin/website-terms/${id}`, { method: 'DELETE' })
      if (r.status === 204) return
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao remover termo do site')
    },
  },
  medicalQuestionnaire: {
    listTemplates: async () => {
      const r = await authFetch('/api/admin/medical-questionnaire/templates')
      const data = await r.json().catch(() => [])
      if (!r.ok) throw new Error(data.error || 'Erro ao listar templates')
      return Array.isArray(data) ? data : []
    },
    createTemplate: async (body) => {
      const r = await authFetch('/api/admin/medical-questionnaire/templates', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar template')
      return data
    },
    updateTemplate: async (id, body) => {
      const r = await authFetch(`/api/admin/medical-questionnaire/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar template')
      return data
    },
    activateTemplate: async (id) => {
      const r = await authFetch(`/api/admin/medical-questionnaire/templates/${id}/activate`, {
        method: 'PATCH',
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao ativar template')
      return data
    },
    deleteTemplate: async (id) => {
      const r = await authFetch(`/api/admin/medical-questionnaire/templates/${id}`, {
        method: 'DELETE',
      })
      if (r.status === 204) return
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao remover template')
    },
    listQuestions: async (templateId) => {
      const r = await authFetch(
        `/api/admin/medical-questionnaire/questions?template_id=${encodeURIComponent(templateId)}`
      )
      const data = await r.json().catch(() => [])
      if (!r.ok) throw new Error(data.error || 'Erro ao listar perguntas')
      return Array.isArray(data) ? data : []
    },
    createQuestion: async (body) => {
      const r = await authFetch('/api/admin/medical-questionnaire/questions', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar pergunta')
      return data
    },
    updateQuestion: async (id, body) => {
      const r = await authFetch(`/api/admin/medical-questionnaire/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar pergunta')
      return data
    },
    deleteQuestion: async (id) => {
      const r = await authFetch(`/api/admin/medical-questionnaire/questions/${id}`, {
        method: 'DELETE',
      })
      if (r.status === 204) return
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao remover pergunta')
    },
    listSubmissions: async () => {
      const r = await authFetch('/api/admin/medical-questionnaire/submissions')
      const data = await r.json().catch(() => [])
      if (!r.ok) throw new Error(data.error || 'Erro ao listar submissões')
      return Array.isArray(data) ? data : []
    },
  },
  analytics: {
    overview: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/analytics/overview${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar visão geral')
      return data
    },
    activeNow: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/analytics/active-now${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar sessões ativas')
      return data
    },
    timeseries: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/analytics/timeseries${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar série temporal')
      return Array.isArray(data) ? data : []
    },
    regionBreakdown: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/analytics/breakdowns/region${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar regiões')
      return Array.isArray(data) ? data : []
    },
    deviceBreakdown: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/analytics/breakdowns/device${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar dispositivos')
      return Array.isArray(data) ? data : []
    },
    topPages: async (params = {}) => {
      const query = new URLSearchParams(params).toString()
      const r = await authFetch(`/api/admin/analytics/breakdowns/pages${query ? `?${query}` : ''}`)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao carregar páginas')
      return Array.isArray(data) ? data : []
    },
  },
  invoices: {
    list: (studentId) => {
      const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : ''
      return authFetch(`/api/admin/invoices${query}`).then((r) => r.json())
    },
    create: async (body) => {
      const r = await authFetch('/api/admin/invoices', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao criar fatura')
      return data
    },
    update: async (id, body) => {
      const r = await authFetch(`/api/admin/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao atualizar fatura')
      return data
    },
  },
  studentMessages: {
    list: (studentId) => {
      const query = studentId ? `?student_id=${encodeURIComponent(studentId)}` : ''
      return authFetch(`/api/admin/student-messages${query}`).then((r) => r.json())
    },
    create: async (body) => {
      const r = await authFetch('/api/admin/student-messages', { method: 'POST', body: JSON.stringify(body) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao enviar mensagem')
      return data
    },
    markRead: async (id) => {
      const r = await authFetch(`/api/admin/student-messages/${id}/read`, { method: 'PATCH' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'Erro ao marcar mensagem')
      return data
    },
  },
}
