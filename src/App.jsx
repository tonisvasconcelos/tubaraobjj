import Header from './components/Header'
import BackgroundVideo from './components/BackgroundVideo'
import HeroGrid from './components/HeroGrid'
import AboutSection from './components/AboutSection'
import Programmes from './components/Programmes'
import JoinFamily from './components/JoinFamily'
import HighlightsCarousel from './components/HighlightsCarousel'
import StoreNewsletter from './components/StoreNewsletter'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <BackgroundVideo />
      <Header />
      <main>
        <HeroGrid />
        <AboutSection />
        <Programmes />
        <JoinFamily />
        <HighlightsCarousel />
        <StoreNewsletter />
      </main>
      <Footer />
    </div>
  )
}

export default App
