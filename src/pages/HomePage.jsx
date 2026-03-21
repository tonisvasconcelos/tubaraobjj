import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroGrid from '../components/HeroGrid'
import AboutSection from '../components/AboutSection'
import Programmes from '../components/Programmes'
import JoinFamily from '../components/JoinFamily'
import HighlightsCarousel from '../components/HighlightsCarousel'
import Seo from '../components/seo/Seo'
import { getWebSiteSchema } from '../seo/organizationSchema'

const HomePage = () => {
  const location = useLocation()
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  return (
    <>
      <Seo
        title="GFTeam Tubarão — Jiu-Jitsu em Vila Isabel, Rio de Janeiro"
        description="Academia GFTeam Tubarão: Jiu-Jitsu para crianças e adultos em Vila Isabel, Rio de Janeiro. Modalidades, horários, equipe, unidades, loja e galeria."
        jsonLd={getWebSiteSchema()}
      />
      <HeroGrid />
      <AboutSection />
      <Programmes />
      <JoinFamily />
      <HighlightsCarousel />
    </>
  )
}

export default HomePage
