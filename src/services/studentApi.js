const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

const STUDENT_TOKEN_KEY = 'studentToken'

export function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY)
}

export function setStudentToken(token) {
  if (token) {
    localStorage.setItem(STUDENT_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(STUDENT_TOKEN_KEY)
  }
}

export async function studentLogin(email, password) {
  const res = await fetch(`${API_URL}/api/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Falha no login do aluno')
  return data
}

async function studentFetch(path, options = {}) {
  const token = getStudentToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res
    .json()
    .catch(() => (res.status === 204 ? null : { error: 'Resposta inválida' }))
  if (!res.ok) throw new Error(data?.error || 'Erro na área do aluno')
  return data
}

export const studentApi = {
  me: () => studentFetch('/api/student/me'),
  planStatus: () => studentFetch('/api/student/plan-status'),
  invoices: () => studentFetch('/api/student/invoices'),
  messages: () => studentFetch('/api/student/messages'),
  sendMessage: (body) => studentFetch('/api/student/messages', { method: 'POST', body: JSON.stringify(body) }),
}
