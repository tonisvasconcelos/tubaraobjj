const Programmes = () => {
  const baseUrl = import.meta.env.BASE_URL
  const programmes = [
    {
      id: 1,
      title: 'Jiu-Jitsu Adulto',
      description: 'Treinamento completo de Jiu-Jitsu para adultos de todos os níveis, desde iniciantes até atletas avançados.',
      image: `${baseUrl}images/Site_ImageBackGround_001.PNG`,
      alt: 'Treino de Jiu-Jitsu Adulto',
    },
    {
      id: 2,
      title: 'Jiu-Jitsu Kids',
      description: 'Programa especializado para crianças, desenvolvendo habilidades físicas, disciplina e valores através do Jiu-Jitsu.',
      image: `${baseUrl}images/Site_ImageBackGround_001.PNG`,
      alt: 'Aula de Jiu-Jitsu Kids',
    },
    {
      id: 3,
      title: 'Condicionamento Funcional',
      description: 'Treinamento funcional para melhorar força, resistência e condicionamento físico geral.',
      image: `${baseUrl}images/Site_ImageBackGround_001.PNG`,
      alt: 'Treino de Condicionamento Funcional',
    },
    {
      id: 4,
      title: 'Programas para Iniciantes',
      description: 'Aulas introdutórias para quem está começando no Jiu-Jitsu, com foco em fundamentos e técnicas básicas.',
      image: `${baseUrl}images/Site_ImageBackGround_001.PNG`,
      alt: 'Aula de fundamentos para iniciantes no Jiu-Jitsu',
    },
  ]

  return (
    <section id="modalidades" className="py-12 sm:py-16 lg:py-24 bg-white/45 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12 sm:mb-16">
          Modalidades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {programmes.map((programme) => (
            <article
              key={programme.id}
              className="h-full overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/60"
            >
              <div className="relative h-52 sm:h-56 lg:h-64">
                <img
                  src={programme.image}
                  alt={programme.alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {programme.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  {programme.description}
                </p>
                <button className="mt-auto w-fit rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg">
                  Saiba mais
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
