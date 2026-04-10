import { useEffect, useState } from 'react'

const BackgroundVideo = () => {
  const baseUrl = import.meta.env.BASE_URL
  const [reduceMotion, setReduceMotion] = useState(false)
  const [allowVideo, setAllowVideo] = useState(false)
  const [startVideo, setStartVideo] = useState(false)
  const backgroundVideo = `${baseUrl}videos/background.mp4`
  const fallbackPoster = `${baseUrl}images/optimized/hero-team-1280.jpg`

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
    const effectiveType = connection?.effectiveType || ''
    const lowBandwidth = effectiveType.includes('2g') || effectiveType === '3g'
    const isDesktopViewport = window.matchMedia?.('(min-width: 1024px)')?.matches ?? true
    const deviceMemory = Number(navigator.deviceMemory || 0)
    const lowMemoryDevice = deviceMemory > 0 && deviceMemory < 4

    const canPlay = !reduceMotion && !saveData && !lowBandwidth && isDesktopViewport && !lowMemoryDevice
    setAllowVideo(canPlay)
  }, [reduceMotion])

  useEffect(() => {
    if (!allowVideo) {
      setStartVideo(false)
      return
    }
    // Let critical images settle before requesting the large background video.
    const timer = window.setTimeout(() => setStartVideo(true), 1800)
    return () => window.clearTimeout(timer)
  }, [allowVideo])

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
          preload="none"
          poster={fallbackPoster}
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Readability overlay (lighter so video is more visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/20 to-white/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.10),rgba(255,255,255,0)_60%)]" />
    </div>
  )
}

export default BackgroundVideo

