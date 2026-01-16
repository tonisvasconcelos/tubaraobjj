import { useState } from 'react'
import { Menu, X, Globe } from 'lucide-react'

const Header = () => {
  const baseUrl = import.meta.env.BASE_URL
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Quem Somos', href: '#quem-somos' },
    { name: 'Aulas e Modalidades', href: '#modalidades' },
    { name: 'Horários', href: '#horarios' },
    { name: 'Equipe', href: '#equipe' },
    { name: 'Contato', href: '#contato' },
    { name: 'Loja', href: '#loja' },
  ]

  const handleLinkClick = (e, href) => {
    e.preventDefault()
    setIsMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 text-slate-900 shadow-sm backdrop-blur border-b border-slate-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Brand: mobile-left, tablet/desktop centered (logo always before text) */}
          <div className="flex-1 flex items-center justify-start">
            <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
              <img
                src={`${baseUrl}images/20397a70-3e6a-4a70-a2cd-e6ad51a59c6e.png`}
                alt="Tubarão logo"
                className="h-10 sm:h-12 md:h-14 w-auto"
              />
              <h1 className="h-10 sm:h-12 md:h-14 flex items-center text-xl sm:text-2xl lg:text-3xl text-left text-slate-900 leading-none">
                <span className="font-extrabold mr-1">tubarão</span>
                <span className="font-medium tracking-wide text-slate-700">jiu‑jitsu</span>
              </h1>
            </div>
          </div>

          {/* Always-collapsed menu (Alliance-style): globe + hamburger visible on all breakpoints */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-slate-700 hover:text-slate-900 transition-colors duration-200"
              aria-label="Language switcher"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Collapsed Navigation Menu (works on desktop + mobile) */}
      {isMenuOpen && (
        <div className="fixed left-0 right-0 top-16 md:top-20 z-50 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="rounded-lg px-4 py-3 text-slate-800 hover:bg-slate-100 transition-colors duration-150"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
