import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'

const HeroGrid = () => {
  const baseUrl = import.meta.env.BASE_URL
  const { t } = useLanguage()
  const heroCards = [
    {
      id: 3,
      titleKey: 'hero.equipe',
      backgroundImage: `${baseUrl}images/TubaraoTeam2.PNG`,
      link: '/team',
    },
    {
      id: 2,
      titleKey: 'hero.unidades',
      backgroundImage: `${baseUrl}images/UnidadeTijuca.png`,
      link: '/addresses',
    },
    {
      id: 1,
      titleKey: 'hero.loja',
      backgroundImage: `${baseUrl}images/ChatGPT%20Image%2016%20de%20jan.%20de%202026,%2013_52_44.png`,
      link: '/store',
    },
  ]

  return (
    <section className="pt-16 md:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Bottom spacing: +20% vs former py-8 / lg:py-12 bottom (2rem→2.4rem, 3rem→3.6rem) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-8 lg:pt-12 pb-[2.4rem] lg:pb-[3.6rem]">
          {heroCards.map((card) => (
            <Link
              key={card.id}
              to={card.link}
              className="relative min-h-[420px] lg:min-h-[560px] overflow-hidden group cursor-pointer rounded-2xl shadow-lg block"
            >
              <div
                className="absolute inset-0 bg-slate-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${card.backgroundImage})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/70 transition-opacity duration-300 group-hover:opacity-90" />
              </div>
              <div className="relative h-full flex flex-col items-center justify-center text-center px-8 min-h-[420px] lg:min-h-[560px]">
                <p className="text-white/80 text-sm tracking-[0.35em] uppercase">
                  {t('hero.brand')}
                </p>
                <h2 className="mt-3 text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow">
                  {t(card.titleKey)}
                </h2>
                <div className="mt-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white/90 transition-transform duration-200 group-hover:scale-110 group-hover:border-white">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroGrid
