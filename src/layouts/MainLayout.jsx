import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import BackgroundVideo from '../components/BackgroundVideo'
import Footer from '../components/Footer'

const MainLayout = () => {
  return (
    <div className="min-h-screen">
      <BackgroundVideo />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
