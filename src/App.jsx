import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './pages/AdminLayout'
import HomePage from './pages/HomePage'
import TeamPage from './pages/TeamPage'
import AddressesPage from './pages/AddressesPage'
import StorePage from './pages/StorePage'
import GalleryPage from './pages/GalleryPage'
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
        { path: 'gallery', element: <GalleryPage /> },
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
  return <RouterProvider router={router} />
}

export default App
