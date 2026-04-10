import { useEffect, useState } from 'react'
import { HERO_OPTIMIZED_MEDIA_VERSION } from '../constants/mediaVersion'

const BackgroundVideo = () => {
  const baseUrl = import.meta.env.BASE_URL
  const [reduceMotion, setReduceMotion] = useState(false)
  const [allowVideo, setAllowVideo] = useState(false)
  const [startVideo, setStartVideo] = useState(false)
  const [useMobileSource, setUseMobileSource] = useState(false)
  const [useSmallMobileSource, setUseSmallMobileSource] = useState(false)
  const backgroundVideo = `${baseUrl}videos/background.mp4`
  const backgroundVideoMobile = `${baseUrl}videos/background-mobile.mp4`
  const backgroundVideoMobileLite = `${baseUrl}videos/background-mobile-lite.mp4`
  const fallbackPoster = `${baseUrl}images/optimized/hero-team-1280.jpg?v=${HERO_OPTIMIZED_MEDIA_VERSION}`

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return

    const onChange = () => setReduceMotion(Boolean(mediaQuery.matches))
    onChange()

    // Safari fallback: addEventListener may not exist
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }
    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [])

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    const saveData = Boolean(connection?.saveData)

    // Keep video enabled by default on mobile and desktop.
    // Only explicit user constraints disable it.
    const canPlay = !reduceMotion && !saveData
    setAllowVideo(canPlay)
  }, [reduceMotion])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 768px)')
    if (!mediaQuery) return
    const onChange = () => setUseMobileSource(Boolean(mediaQuery.matches))
    onChange()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }
    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 480px)')
    if (!mediaQuery) return
    const onChange = () => setUseSmallMobileSource(Boolean(mediaQuery.matches))
    onChange()
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }
    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [])

  useEffect(() => {
    if (!allowVideo) {
      setStartVideo(false)
      return
    }
    // Start immediately on mobile, keep desktop warm-up to protect LCP.
    const delayMs = useMobileSource ? 0 : 900
    const timer = window.setTimeout(() => setStartVideo(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [allowVideo, useMobileSource])

  const selectedVideoSource = useMobileSource
    ? useSmallMobileSource
      ? backgroundVideoMobileLite
      : backgroundVideoMobile
    : backgroundVideo

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Always-visible fallback background (no logo while video buffers) */}
      <div className="absolute inset-0 bg-slate-950" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),rgba(2,6,23,0)_55%)]"
        aria-hidden="true"
      />

      {allowVideo && startVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload={useMobileSource ? 'auto' : 'metadata'}
          poster={fallbackPoster}
          aria-hidden="true"
        >
          <source src={selectedVideoSource} type="video/mp4" />
        </video>
      )}

      {/* Readability overlay (lighter so video is more visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/20 to-white/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.10),rgba(255,255,255,0)_60%)]" />
    </div>
  )
}

export default BackgroundVideo

