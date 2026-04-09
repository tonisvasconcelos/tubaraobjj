const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const GTM_ID = import.meta.env.VITE_GTM_ID

function appendScript(src, attrs = {}) {
  if (typeof document === 'undefined') return
  const script = document.createElement('script')
  script.src = src
  script.async = true
  for (const [key, value] of Object.entries(attrs)) {
    script.setAttribute(key, value)
  }
  document.head.appendChild(script)
}

export function initAnalytics() {
  if (typeof window === 'undefined') return

  if (GTM_ID && !window.__tbjGtmLoaded) {
    appendScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`)
    window.__tbjGtmLoaded = true
  }

  if (GA_MEASUREMENT_ID && !window.__tbjGaLoaded) {
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
    window.__tbjGaLoaded = true
  }
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', eventName, params)
  }
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...params })
}

export function trackPageView(pathname) {
  if (typeof window === 'undefined') return
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      send_to: GA_MEASUREMENT_ID,
    })
  }
}
