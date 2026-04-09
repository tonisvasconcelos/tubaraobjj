import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from '../components/Header'
import BackgroundVideo from '../components/BackgroundVideo'
import Footer from '../components/Footer'
import AnalyticsPageTracker from '../components/analytics/AnalyticsPageTracker'
import { getOrganizationSchema } from '../seo/organizationSchema'

const MainLayout = () => {
  const organizationLd = JSON.stringify(getOrganizationSchema())
  return (
    <div className="min-h-screen">
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationLd }}
        />
      </Helmet>
      <BackgroundVideo />
      <Header />
      <AnalyticsPageTracker />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
