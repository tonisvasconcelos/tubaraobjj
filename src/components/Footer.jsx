import { useState } from 'react'
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const companyInfo = {
    address: 'Rua Teodoro da Silva 725, Vila Isabel – Rio de Janeiro',
    phone: '(21) 1234-5678',
    email: 'contato@gfteamtubarao.com.br',
    instagramUrl: 'https://instagram.com/gfteamtubarao',
    facebookUrl: 'https://facebook.com/gfteamtubarao',
  }

  const quickLinks = [
    { name: 'Quem Somos', href: '#quem-somos' },
    { name: 'Modalidades', href: '#modalidades' },
    { name: 'Horários', href: '#horarios' },
    { name: 'Contato', href: '#contato' },
    { name: 'Loja', href: '#loja' },
  ]

  const handleLinkClick = (e, href) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    // TODO: Integrate with Strapi API
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitMessage('Inscrição realizada com sucesso!')
      setEmail('')
    }, 1000)
  }

  return (
    <footer id="contato" className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
              GFTeam Tubarão
            </h3>
            <p className="text-sm sm:text-base text-gray-300 text-center sm:text-left">
              Jiu-Jitsu Academy
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">
              Links Rápidos
            </h4>
            <ul className="space-y-2 text-center sm:text-left">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">
              Contato
            </h4>
            <ul className="space-y-3 text-sm sm:text-base text-gray-300 text-center sm:text-left">
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 flex-shrink-0" />
                <span>{companyInfo.address}</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 flex-shrink-0" />
                <a href={`tel:${companyInfo.phone}`} className="hover:text-white transition-colors">
                  {companyInfo.phone}
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start space-x-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 flex-shrink-0" />
                <a href={`mailto:${companyInfo.email}`} className="hover:text-white transition-colors">
                  {companyInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">
              Newsletter
            </h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              />
              {submitMessage && (
                <div className="p-2 bg-green-900 text-green-100 rounded-lg text-xs sm:text-sm">
                  {submitMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white/90 hover:bg-white text-slate-900 font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? 'Enviando...' : 'Inscrever-se'}
              </button>
            </form>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex justify-center space-x-6 mb-8 lg:mb-12">
          <a
            href={companyInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
          </a>
          <a
            href={companyInfo.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-200"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-sm sm:text-base text-gray-400">
            <p>© {new Date().getFullYear()} GFTeam Tubarão. Todos os direitos reservados.</p>
            <a
              href="#privacy"
              className="hover:text-white transition-colors duration-200"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
