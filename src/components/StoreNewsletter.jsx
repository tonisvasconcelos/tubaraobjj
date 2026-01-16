import { useState } from 'react'
import { ShoppingBag, ArrowRight } from 'lucide-react'

const StoreNewsletter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    acceptTerms: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    // TODO: Integrate with Strapi API
    // For now, simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitMessage('Inscrição realizada com sucesso!')
      setFormData({
        name: '',
        email: '',
        phone: '',
        acceptTerms: false,
      })
    }, 1000)
  }

  const storeData = {
    title: 'Loja Tubarão',
    description: 'Confira nossa linha de produtos exclusivos da GFTeam Tubarão. Roupas, equipamentos e acessórios de alta qualidade.',
    link: '#loja',
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white/45 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-6">
          {/* Store Card */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 text-white">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-white/15 p-3 rounded-full">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {storeData.title}
              </h3>
            </div>
            <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-gray-300 leading-relaxed">
              {storeData.description}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault()
                const element = document.querySelector(storeData.link)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span>Visitar Loja</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Newsletter Form */}
          <div className="bg-white/65 backdrop-blur-md rounded-lg shadow-md border border-white/40 p-6 sm:p-8 lg:p-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
              Newsletter
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8">
              Receba novidades, dicas de treino e informações sobre eventos da academia.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                  className="mt-1 mr-3 w-4 h-4 text-slate-700 focus:ring-slate-400 border-slate-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-slate-600">
                  Aceito os termos de privacidade e política de dados
                </label>
              </div>
              {submitMessage && (
                <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                  {submitMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Inscrever-se'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoreNewsletter
