import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Users, MapPin, ShoppingBag, Image, Mail, Star, Calendar, LogOut } from 'lucide-react'

const navItems = [
  { path: 'team', label: 'Equipe', icon: Users },
  { path: 'schedules', label: 'Horários', icon: Calendar },
  { path: 'branches', label: 'Unidades', icon: MapPin },
  { path: 'products', label: 'Loja', icon: ShoppingBag },
  { path: 'gallery', label: 'Galeria', icon: Image },
  { path: 'contacts', label: 'Contatos', icon: Mail },
  { path: 'highlights', label: 'Destaques', icon: Star },
]

export default function AdminDashboard({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-56 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-lg">Admin Tubarão</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
