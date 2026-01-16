import { useState } from 'react'
import { Plus } from 'lucide-react'

const HeroGrid = () => {
  const baseUrl = import.meta.env.BASE_URL
  const [heroCards, setHeroCards] = useState([
    {
      id: 3,
      title: 'equipe',
      description: 'Conheça o Professor Márcio "Tubarão" e nossa equipe de instrutores dedicados.',
      backgroundImage: `${baseUrl}images/WhatsApp%20Image%202025-03-31%20at%2019.28.50_60c70bff.jpg`,
      link: '#equipe',
    },
    {
      id: 2,
      title: 'unidades',
      description: 'Confira nossos horários de aulas e encontre o melhor momento para você treinar.',
      backgroundImage: `${baseUrl}images/UnidadeTijuca.png`,
      link: '#horarios',
    },
    {
      id: 1,
      title: 'loja',
      description: 'Descubra nossos programas de Jiu-Jitsu para adultos e crianças, além de treinamento funcional.',
      backgroundImage: `${baseUrl}images/ChatGPT%20Image%2016%20de%20jan.%20de%202026,%2013_52_44.png`,
      link: '#modalidades',
    },
  ])

  const handleCardClick = (e, href) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="pt-16 md:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 py-8 lg:py-12">
        {heroCards.map((card) => (
          <div
            key={card.id}
            className="relative min-h-[420px] lg:min-h-[560px] overflow-hidden group cursor-pointer rounded-2xl shadow-lg"
            onClick={(e) => handleCardClick(e, card.link)}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-slate-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `url(${card.backgroundImage})`,
              }}
            >
              {/* Alliance-like overlay (dark, premium) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/70 transition-opacity duration-300 group-hover:opacity-90" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
              <p className="text-white/80 text-sm tracking-[0.35em] uppercase">
                tubarão
              </p>
              <h2 className="mt-3 text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow">
                {card.title}
              </h2>
              <div className="mt-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white/90 transition-transform duration-200 group-hover:scale-110 group-hover:border-white">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  )
}

export default HeroGrid
