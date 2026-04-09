import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageProvider'

const MainLayout = lazy(() => import('./layouts/MainLayout'))
const AdminLayout = lazy(() => import('./pages/AdminLayout'))
const HomePage = lazy(() => import('./pages/HomePage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const AddressesPage = lazy(() => import('./pages/AddressesPage'))
const StorePage = lazy(() => import('./pages/StorePage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const TrialClassPage = lazy(() => import('./pages/TrialClassPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminSection = lazy(() => import('./pages/admin/AdminSection'))

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <p className="text-slate-600 text-sm sm:text-base">Carregando...</p>
    </div>
  )
}

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
        { path: 'aula-experimental', element: <TrialClassPage /> },
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
      <Suspense fallback={<RouteFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </LanguageProvider>
  )
}

export default App
