import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageProvider'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './pages/AdminLayout'
import HomePage from './pages/HomePage'
import TeamPage from './pages/TeamPage'
import AddressesPage from './pages/AddressesPage'
import StorePage from './pages/StorePage'
import SchedulePage from './pages/SchedulePage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminSection from './pages/admin/AdminSection'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'team', element: <TeamPage /> },
        { path: 'addresses', element: <AddressesPage /> },
        { path: 'store', element: <StorePage /> },
        { path: 'horarios', element: <SchedulePage /> },
      ],
    },
    {
      path: '/admin',
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminLoginPage /> },
        { path: ':section', element: <AdminSection /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
)

function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  )
}

export default App
