import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import { HERO_OPTIMIZED_MEDIA_VERSION } from '../constants/mediaVersion'

const HeroGrid = () => {
  const baseUrl = import.meta.env.BASE_URL
  const { t } = useLanguage()
  const heroWidths = [640, 960, 1280, 1600]
  const q = `v=${HERO_OPTIMIZED_MEDIA_VERSION}`
  const buildSrcSet = (imageId, extension) =>
    heroWidths
      .map(
        (width) =>
          `${baseUrl}images/optimized/${imageId}-${width}.${extension}?${q} ${width}w`
      )
      .join(', ')
  const heroCards = [
    {
      id: 3,
      titleKey: 'hero.equipe',
      imageId: 'hero-team',
      fallbackImage: `${baseUrl}images/${encodeURIComponent('Marcio Tubarão2.JPG')}`,
      link: '/team',
    },
    {
      id: 2,
      titleKey: 'hero.unidades',
      imageId: 'hero-branches',
      fallbackImage: `${baseUrl}images/UnidadeTijuca2.PNG`,
      link: '/addresses',
    },
    {
      id: 1,
      titleKey: 'hero.loja',
      imageId: 'hero-store',
      fallbackImage: `${baseUrl}images/ChatGPT%20Image%2016%20de%20jan.%20de%202026,%2013_52_44.png`,
      link: '/store',
    },
  ]

  return (
    <section className="pt-16 md:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Bottom spacing: +20% vs former py-8 / lg:py-12 bottom (2rem→2.4rem, 3rem→3.6rem) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-8 lg:pt-12 pb-[2.4rem] lg:pb-[3.6rem]">
          {heroCards.map((card, index) => (
            <Link
              key={card.id}
              to={card.link}
              className="relative min-h-[420px] lg:min-h-[560px] overflow-hidden group cursor-pointer rounded-2xl shadow-lg block"
            >
              <picture className="absolute inset-0 bg-slate-200 transition-transform duration-700 group-hover:scale-110">
                <source type="image/webp" srcSet={buildSrcSet(card.imageId, 'webp')} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                <source type="image/jpeg" srcSet={buildSrcSet(card.imageId, 'jpg')} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                <img
                  src={`${baseUrl}images/optimized/${card.imageId}-960.jpg?${q}`}
                  alt={t(card.titleKey)}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = card.fallbackImage
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/70 transition-opacity duration-300 group-hover:opacity-90" />
              </picture>
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
