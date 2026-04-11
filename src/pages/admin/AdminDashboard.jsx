import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Users,
  UserCircle2,
  MapPin,
  ShoppingBag,
  Mail,
  Star,
  Calendar,
  ClipboardList,
  MessageSquare,
  LogOut,
  Menu,
  X,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { path: 'team', label: 'Equipe', icon: Users },
  { path: 'schedules', label: 'Horários', icon: Calendar },
  { path: 'branches', label: 'Unidades', icon: MapPin },
  { path: 'products', label: 'Loja', icon: ShoppingBag },
  { path: 'students', label: 'Alunos', icon: UserCircle2 },
  { path: 'plans', label: 'Planos', icon: ClipboardList },
  { path: 'trial', label: 'Aula Experimental', icon: Calendar },
  { path: 'website-terms', label: 'Termos do Site', icon: ShieldCheck },
  { path: 'medical-questionnaire', label: 'Questionário Médico', icon: ClipboardList },
  { path: 'analytics', label: 'Analytics', icon: BarChart3 },
  { path: 'invoices', label: 'Faturas', icon: ClipboardList },
  { path: 'student-messages', label: 'Mensagens Alunos', icon: MessageSquare },
  { path: 'contacts', label: 'Contatos', icon: Mail },
  { path: 'highlights', label: 'Destaques', icon: Star },
]

export default function AdminDashboard({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuExpanded, setIsMenuExpanded] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside
        className={`hidden md:flex bg-slate-800 text-white flex-col transition-[width] duration-200 ${
          isMenuExpanded ? 'w-60' : 'w-20'
        }`}
      >
        <div
          className={`p-4 border-b border-slate-700 flex items-center ${
            isMenuExpanded ? 'justify-between' : 'justify-center'
          }`}
        >
          {isMenuExpanded ? <h2 className="font-bold text-lg">Admin Tubarão</h2> : null}
          <button
            type="button"
            onClick={() => setIsMenuExpanded((prev) => !prev)}
            className="rounded-md p-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label={isMenuExpanded ? 'Colapsar menu' : 'Expandir menu'}
            title={isMenuExpanded ? 'Colapsar menu' : 'Expandir menu'}
          >
            {isMenuExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center rounded-lg transition-colors ${
                  isMenuExpanded ? 'gap-2 px-3 py-2 justify-start' : 'justify-center px-2 py-2'
                } ${
                  isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isMenuExpanded ? <span>{label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-700">
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className={`w-full rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${
              isMenuExpanded ? 'flex items-center gap-2 px-3 py-2' : 'flex items-center justify-center px-2 py-2'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isMenuExpanded ? <span>Sair</span> : null}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-max flex items-stretch gap-1 px-2 py-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={`/admin/${path}`}
                aria-label={label}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                    isActive ? 'bg-slate-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs whitespace-nowrap text-rose-100 hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
