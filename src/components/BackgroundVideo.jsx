import { useEffect, useState } from 'react'

const BackgroundVideo = () => {
  const baseUrl = import.meta.env.BASE_URL
  const [reduceMotion, setReduceMotion] = useState(false)
  const backgroundImage = `${baseUrl}images/ChatGPT%20Image%209%20de%20ago.%20de%202025,%2016_00_02.png`

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

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Always-visible background image (safe for GitHub Pages repo size limits) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />

      {!reduceMotion && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          {/* Video disabled for now (files too large for standard GitHub pushes). */}
        </video>
      )}

      {/* Readability overlay (lighter so video is more visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/20 to-white/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.10),rgba(255,255,255,0)_60%)]" />
    </div>
  )
}

export default BackgroundVideo

