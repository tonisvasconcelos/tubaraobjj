import { useLanguage } from '../i18n/LanguageProvider'

const AboutSection = () => {
  const baseUrl = import.meta.env.BASE_URL
  const { t } = useLanguage()
  const aboutWidths = [640, 960, 1280, 1600]
  const aboutWebpSrcSet = aboutWidths
    .map((width) => `${baseUrl}images/optimized/about-marcio-${width}.webp ${width}w`)
    .join(', ')
  const aboutJpgSrcSet = aboutWidths
    .map((width) => `${baseUrl}images/optimized/about-marcio-${width}.jpg ${width}w`)
    .join(', ')
  const aboutData = {
    professorImage: `${baseUrl}images/TubaDesertPB.JPG`,
  }

  return (
    <section id="quem-somos" className="py-0 bg-white/55 backdrop-blur-[2px]">
      <div className="w-full">
        <div className="relative overflow-hidden border-y border-white/50 shadow-xl">
          <picture>
            <source type="image/webp" srcSet={aboutWebpSrcSet} sizes="100vw" />
            <source type="image/jpeg" srcSet={aboutJpgSrcSet} sizes="100vw" />
            <img
              src={`${baseUrl}images/optimized/about-marcio-1280.jpg`}
              alt={t('about.quoteAuthor')}
              width="1400"
              height="800"
              loading="lazy"
              decoding="async"
              className="h-[280px] sm:h-[360px] md:h-[480px] lg:h-[540px] w-full object-cover opacity-80"
              onError={(event) => {
                event.currentTarget.src = aboutData.professorImage
              }}
            />
          </picture>

          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />

          <div className="relative md:absolute md:inset-0 md:flex md:items-center">
            <div className="w-full max-w-2xl bg-black/70 p-5 text-white sm:p-6 md:bg-transparent md:px-8 md:py-0 lg:px-10">
              <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-semibold italic leading-relaxed">
                "{t('about.quote')}"
              </blockquote>
              <p className="mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-white/85 font-medium">
                — {t('about.quoteAuthor')}
              </p>

              <div className="mt-4 space-y-3 text-xs sm:text-sm md:text-base lg:text-lg text-white/90 leading-relaxed">
                <p>{t('about.description')}</p>
                <p>{t('about.gfteam')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
