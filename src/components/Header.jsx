import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Globe } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'

const Header = () => {
  const baseUrl = import.meta.env.BASE_URL
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === ''
  const { lang, setLang, t } = useLanguage()

  const navItems = [
    { tKey: 'nav.about', href: '/', hash: '#quem-somos' },
    { tKey: 'nav.programmes', href: '/', hash: '#modalidades' },
    { tKey: 'nav.schedule', path: '/horarios' },
    { tKey: 'nav.team', path: '/team' },
    { tKey: 'nav.addresses', path: '/addresses' },
    { tKey: 'nav.store', path: '/store' },
    { tKey: 'nav.gallery', path: '/gallery' },
    { tKey: 'nav.contact', href: '/', hash: '#contato' },
  ]

  const handleLinkClick = (e, item) => {
    setIsMenuOpen(false)
    if (item.hash && isHome) {
      e.preventDefault()
      const element = document.querySelector(item.hash)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const langRef = useRef(null)

  useEffect(() => {
    if (!isLangOpen) return
    const onDown = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [isLangOpen])

  const openMenu = () => {
    setIsMenuOpen(true)
    setIsLangOpen(false)
  }

  const selectLanguage = (code) => {
    setLang(code)
    setIsLangOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 text-slate-900 shadow-sm backdrop-blur border-b border-slate-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={`${baseUrl}images/20397a70-3e6a-4a70-a2cd-e6ad51a59c6e.png`}
                  alt="Tubarão logo"
                  className="h-10 sm:h-12 md:h-14 w-auto"
                />
                <h1 className="h-10 sm:h-12 md:h-14 flex items-center text-xl sm:text-2xl lg:text-3xl text-left text-slate-900 leading-none">
                  <span className="font-extrabold mr-1">tubarão</span>
                  <span className="font-medium tracking-wide text-slate-700">jiu‑jitsu</span>
                </h1>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative" ref={langRef}>
              <button
                type="button"
                className="p-2 text-slate-700 hover:text-slate-900 transition-colors duration-200"
                aria-label={t('aria.language')}
                aria-expanded={isLangOpen}
                aria-haspopup="listbox"
                onClick={() => setIsLangOpen((v) => !v)}
              >
                <Globe className="w-5 h-5" />
              </button>
              {isLangOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 mt-1 min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-[60]"
                >
                  {[
                    { code: 'pt', labelKey: 'lang.pt' },
                    { code: 'en', labelKey: 'lang.en' },
                    { code: 'es', labelKey: 'lang.es' },
                  ].map(({ code, labelKey }) => (
                    <li key={code} role="option" aria-selected={lang === code}>
                      <button
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 ${
                          lang === code ? 'font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                        onClick={() => selectLanguage(code)}
                      >
                        {t(labelKey)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => (isMenuOpen ? setIsMenuOpen(false) : openMenu())}
              className="p-2 text-slate-700 hover:text-slate-900 transition-colors duration-200"
              aria-label={t('aria.menu')}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed left-0 right-0 top-16 md:top-20 z-50 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {navItems.map((item) => {
                if (item.path) {
                  return (
                    <Link
                      key={item.tKey}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-slate-800 hover:bg-slate-100 transition-colors duration-150"
                    >
                      {t(item.tKey)}
                    </Link>
                  )
                }
                const to = `${item.href}${item.hash || ''}`
                return (
                  <Link
                    key={item.tKey}
                    to={to}
                    onClick={(e) => handleLinkClick(e, item)}
                    className="rounded-lg px-4 py-3 text-slate-800 hover:bg-slate-100 transition-colors duration-150"
                  >
                    {t(item.tKey)}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
