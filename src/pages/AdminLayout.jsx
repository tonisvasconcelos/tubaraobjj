import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLayout() {
  const { token } = useAuth()
  const location = useLocation()
  const isIndex = location.pathname === '/admin' || location.pathname === '/admin/'

  if (!token) {
    if (isIndex) {
      return <Outlet />
    }
    return <Navigate to="/admin" replace />
  }

  if (isIndex) {
    return <Navigate to="/admin/team" replace />
  }

  return <Outlet />
}
