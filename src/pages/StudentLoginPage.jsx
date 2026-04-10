import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../contexts/StudentAuthContext'

const LOGIN_BG_FILE = 'ChatGPT Image 4 de ago. de 2025, 16_26_08.png'

export default function StudentLoginPage() {
  const baseUrl = import.meta.env.BASE_URL
  const loginBgUrl = `${baseUrl}images/${encodeURIComponent(LOGIN_BG_FILE)}`
  const navigate = useNavigate()
  const { login } = useStudentAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/aluno', { replace: true })
    } catch (err) {
      setError(err.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="relative min-h-screen bg-slate-200 bg-cover bg-center bg-no-repeat pt-24 pb-16 px-4"
      style={{ backgroundImage: `url('${loginBgUrl}')` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/75" aria-hidden="true" />
      <div className="relative z-10 max-w-md mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow overflow-hidden">
        <div className="w-full bg-slate-100 h-28 sm:h-32 flex items-center justify-center p-2 sm:p-3">
          <img
            src={`${baseUrl}images/20397a70-3e6a-4a70-a2cd-e6ad51a59c6e.png`}
            alt=""
            className="w-full h-full object-contain object-center"
            decoding="async"
          />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Área do Aluno</h1>
          <p className="text-slate-600 mb-6">Entre com seu email e senha cadastrados pela administração.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <input
              type="password"
              required
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            {error ? <p className="text-red-700 text-sm">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </section>
  )
}
