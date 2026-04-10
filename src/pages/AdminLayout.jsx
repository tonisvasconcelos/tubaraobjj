import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../contexts/AuthContext'
import ScrollToTop from '../components/ScrollToTop'

const adminSeoHelmet = (
  <Helmet>
    <meta name="robots" content="noindex, nofollow" />
  </Helmet>
)

export default function AdminLayout() {
  const { token } = useAuth()
  const location = useLocation()
  const isIndex = location.pathname === '/admin' || location.pathname === '/admin/'

  if (!token) {
    if (isIndex) {
      return (
        <>
          {adminSeoHelmet}
          <ScrollToTop />
          <Outlet />
        </>
      )
    }
    return (
      <>
        {adminSeoHelmet}
        <Navigate to="/admin" replace />
      </>
    )
  }

  if (isIndex) {
    return (
      <>
        {adminSeoHelmet}
        <Navigate to="/admin/team" replace />
      </>
    )
  }

  return (
    <>
      {adminSeoHelmet}
      <ScrollToTop />
      <Outlet />
    </>
  )
}
