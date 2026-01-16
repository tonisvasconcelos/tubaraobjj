import { Users, Baby, Activity, GraduationCap } from 'lucide-react'

const Programmes = () => {
  const programmes = [
    {
      id: 1,
      title: 'Jiu-Jitsu Adulto',
      description: 'Treinamento completo de Jiu-Jitsu para adultos de todos os níveis, desde iniciantes até atletas avançados.',
      icon: Users,
    },
    {
      id: 2,
      title: 'Jiu-Jitsu Kids',
      description: 'Programa especializado para crianças, desenvolvendo habilidades físicas, disciplina e valores através do Jiu-Jitsu.',
      icon: Baby,
    },
    {
      id: 3,
      title: 'Condicionamento Funcional',
      description: 'Treinamento funcional para melhorar força, resistência e condicionamento físico geral.',
      icon: Activity,
    },
    {
      id: 4,
      title: 'Programas para Iniciantes',
      description: 'Aulas introdutórias para quem está começando no Jiu-Jitsu, com foco em fundamentos e técnicas básicas.',
      icon: GraduationCap,
    },
  ]

  return (
    <section id="modalidades" className="py-12 sm:py-16 lg:py-24 bg-white/45 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12 sm:mb-16">
          Modalidades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-6">
          {programmes.map((programme) => {
            const IconComponent = programme.icon
            return (
              <div
                key={programme.id}
                className="bg-white/60 backdrop-blur-md rounded-lg shadow-sm border border-white/40 p-6 sm:p-8 hover:shadow-lg hover:border-white/60 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-slate-100 p-4 rounded-full group-hover:bg-slate-200 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-700" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                    {programme.title}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
                    {programme.description}
                  </p>
                  <button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                    Saiba mais
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Programmes
