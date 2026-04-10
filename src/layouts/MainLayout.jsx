import { Outlet, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from '../components/Header'
import BackgroundVideo from '../components/BackgroundVideo'
import Footer from '../components/Footer'
import AnalyticsPageTracker from '../components/analytics/AnalyticsPageTracker'
import ScrollToTop from '../components/ScrollToTop'
import { getOrganizationSchema } from '../seo/organizationSchema'

const MainLayout = () => {
  const baseUrl = import.meta.env.BASE_URL
  const location = useLocation()
  const isTrialPage = location.pathname === '/aula-experimental'
  const organizationLd = JSON.stringify(getOrganizationSchema())
  return (
    <div className="min-h-screen">
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationLd }}
        />
      </Helmet>
      {isTrialPage ? (
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${baseUrl}images/UnidadeTijuca.png)` }}
          />
          <div className="absolute inset-0 bg-white/45" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.18),rgba(255,255,255,0)_65%)]" />
        </div>
      ) : (
        <BackgroundVideo />
      )}
      <ScrollToTop />
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
