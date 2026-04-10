import { useParams, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import TeamManage from './TeamManage'
import BranchesManage from './BranchesManage'
import ProductsManage from './ProductsManage'
import ContactsList from './ContactsList'
import HighlightsManage from './HighlightsManage'
import SchedulesManage from './SchedulesManage'
import StudentsManage from './StudentsManage'
import PlansManage from './PlansManage'
import TrialBookingsManage from './TrialBookingsManage'
import InvoicesManage from './InvoicesManage'
import StudentMessagesManage from './StudentMessagesManage'
import AnalyticsManage from './AnalyticsManage'

const SECTIONS = {
  team: TeamManage,
  branches: BranchesManage,
  products: ProductsManage,
  contacts: ContactsList,
  highlights: HighlightsManage,
  schedules: SchedulesManage,
  students: StudentsManage,
  plans: PlansManage,
  trial: TrialBookingsManage,
  analytics: AnalyticsManage,
  invoices: InvoicesManage,
  'student-messages': StudentMessagesManage,
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
