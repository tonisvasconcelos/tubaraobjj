import { ArrowRight } from 'lucide-react'

const JoinFamily = () => {
  const cards = [
    {
      id: 1,
      title: 'Quero treinar',
      description: 'Venha fazer uma aula experimental e conheça nossa metodologia. Oferecemos aulas para todos os níveis e idades.',
      buttonText: 'Agendar aula experimental',
      link: '#contato',
    },
  ]

  const handleButtonClick = (e, href) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white/45 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-6 max-w-2xl mx-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white/60 backdrop-blur-md rounded-lg shadow-md border border-white/40 p-6 sm:p-8 lg:p-12 hover:shadow-lg hover:border-white/60 transition-all duration-300"
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
                {card.title}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                {card.description}
              </p>
              <button
                onClick={(e) => handleButtonClick(e, card.link)}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>{card.buttonText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default JoinFamily
