import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HeroGrid from '../components/HeroGrid'
import AboutSection from '../components/AboutSection'
import Programmes from '../components/Programmes'
import JoinFamily from '../components/JoinFamily'
import HighlightsCarousel from '../components/HighlightsCarousel'

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
      <HeroGrid />
      <AboutSection />
      <Programmes />
      <JoinFamily />
      <HighlightsCarousel />
    </>
  )
}

export default HomePage
