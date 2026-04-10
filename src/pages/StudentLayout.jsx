import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../contexts/StudentAuthContext'
import ScrollToTop from '../components/ScrollToTop'

export default function StudentLayout() {
  const navigate = useNavigate()
  const { token, logout } = useStudentAuth()

  if (!token) return <Navigate to="/aluno/login" replace />

  function onLogout() {
    logout()
    navigate('/aluno/login', { replace: true })
  }

  return (
    <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <ScrollToTop />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <NavLink
            to="/aluno"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg border ${
                isActive ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-700'
              }`
            }
          >
            Meu plano
          </NavLink>
          <NavLink
            to="/aluno/mensagens"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg border ${
                isActive ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-700'
              }`
            }
          >
            Mensagens
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="ml-auto px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
        <Outlet />
      </div>
    </section>
  )
}
