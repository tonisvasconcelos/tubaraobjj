import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../contexts/StudentAuthContext'

export default function StudentLoginPage() {
  const baseUrl = import.meta.env.BASE_URL
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
    <section className="pt-24 pb-16 px-4">
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl shadow overflow-hidden">
        <div className="w-full bg-slate-100">
          <img
            src={`${baseUrl}images/20397a70-3e6a-4a70-a2cd-e6ad51a59c6e.png`}
            alt=""
            className="w-full h-40 sm:h-44 object-cover object-center"
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
    </section>
  )
}
