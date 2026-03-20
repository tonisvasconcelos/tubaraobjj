const Programmes = () => {
  const baseUrl = import.meta.env.BASE_URL
  const programmes = [
    {
      id: 1,
      title: 'Jiu-Jitsu Adulto Unissex',
      description: 'Aulas para adultos de todas as idades, sem limite etário, com turmas unissex para iniciantes e graduados.',
      image: `${baseUrl}images/Site_ImageBackGround_001.PNG`,
      alt: 'Treino de Jiu-Jitsu adulto unissex',
    },
    {
      id: 2,
      title: 'Jiu-Jitsu Gi e No Gi',
      description: 'Treinos técnicos com kimono (Gi) e sem kimono (No Gi), desenvolvendo adaptação, estratégia e performance.',
      image: `${baseUrl}images/Nogi.PNG`,
      alt: 'Treino de Jiu-Jitsu Gi e No Gi',
    },
    {
      id: 3,
      title: 'Jiu-Jitsu Feminino',
      description: 'Aulas exclusivas para mulheres, em um ambiente acolhedor e seguro, focado em técnica, confiança e evolução.',
      image: `${baseUrl}images/TubaFemTurma.JPG`,
      alt: 'Aula de Jiu-Jitsu feminino',
    },
    {
      id: 4,
      title: 'Jiu-Jitsu Baby e Juvenil',
      description: 'Programa para crianças e jovens com foco em coordenação, disciplina, respeito e desenvolvimento técnico no Jiu-Jitsu.',
      image: `${baseUrl}images/TubaKids.JPG`,
      alt: 'Aula de Jiu-Jitsu Baby e Juvenil',
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
