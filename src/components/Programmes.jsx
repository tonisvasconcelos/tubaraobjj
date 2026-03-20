import { useLanguage } from '../i18n/LanguageProvider'

const Programmes = () => {
  const baseUrl = import.meta.env.BASE_URL
  const { t } = useLanguage()

  const programmeDefs = [
    {
      id: 1,
      titleKey: 'programmes.p1.title',
      descKey: 'programmes.p1.desc',
      altKey: 'programmes.p1.alt',
      image: `${baseUrl}images/Site_ImageBackGround_001.PNG`,
    },
    {
      id: 2,
      titleKey: 'programmes.p2.title',
      descKey: 'programmes.p2.desc',
      altKey: 'programmes.p2.alt',
      image: `${baseUrl}images/Nogi.PNG`,
    },
    {
      id: 3,
      titleKey: 'programmes.p3.title',
      descKey: 'programmes.p3.desc',
      altKey: 'programmes.p3.alt',
      image: `${baseUrl}images/TubaFemTurma.JPG`,
    },
    {
      id: 4,
      titleKey: 'programmes.p4.title',
      descKey: 'programmes.p4.desc',
      altKey: 'programmes.p4.alt',
      image: `${baseUrl}images/TubaKids.JPG`,
    },
  ]

  return (
    <section id="modalidades" className="py-12 sm:py-16 lg:py-24 bg-white/45 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12 sm:mb-16">
          {t('programmes.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {programmeDefs.map((programme) => (
            <article
              key={programme.id}
              className="h-full overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/60"
            >
              <div className="relative h-52 sm:h-56 lg:h-64">
                <img
                  src={programme.image}
                  alt={t(programme.altKey)}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t(programme.titleKey)}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  {t(programme.descKey)}
                </p>
                <button
                  type="button"
                  className="mt-auto w-fit rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg"
                >
                  {t('programmes.learnMore')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programmes
