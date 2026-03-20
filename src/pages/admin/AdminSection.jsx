import { useParams, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import TeamManage from './TeamManage'
import BranchesManage from './BranchesManage'
import ProductsManage from './ProductsManage'
import GalleryManage from './GalleryManage'
import ContactsList from './ContactsList'
import HighlightsManage from './HighlightsManage'
import SchedulesManage from './SchedulesManage'

const SECTIONS = {
  team: TeamManage,
  branches: BranchesManage,
  products: ProductsManage,
  gallery: GalleryManage,
  contacts: ContactsList,
  highlights: HighlightsManage,
  schedules: SchedulesManage,
}

export default function AdminSection() {
  const { section } = useParams()
  const Component = section ? SECTIONS[section] : null
  if (!Component) {
    return <Navigate to="/admin/team" replace />
  }
  return (
    <AdminDashboard>
      <Component />
    </AdminDashboard>
  )
}
