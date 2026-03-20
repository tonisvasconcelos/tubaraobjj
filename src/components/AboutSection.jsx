const AboutSection = () => {
  const baseUrl = import.meta.env.BASE_URL
  const aboutData = {
    quote: 'Acreditamos no jiu-jitsu como instrumento de transformação e saúde para todos.',
    quoteAuthor: 'Prof. Márcio "Tubarão"',
    description: 'A GFTeam Tubarão é uma academia de Jiu-Jitsu dedicada a proporcionar uma experiência completa de treinamento para alunos de todas as idades e níveis. Nossa missão é desenvolver não apenas habilidades técnicas, mas também valores como disciplina, respeito e superação pessoal.',
    gfteamAffiliation: 'Fazemos parte da rede GFTeam, uma das maiores e mais respeitadas equipes de Jiu-Jitsu do mundo, garantindo metodologia de ensino de excelência e suporte técnico de alto nível.',
    professorImage: `${baseUrl}images/TubaDesertPB.JPG`,
  }

  return (
    <section id="quem-somos" className="py-12 sm:py-16 lg:py-24 bg-white/55 backdrop-blur-[2px]">
      <div className="w-full">
        <div className="relative overflow-hidden border-y border-white/50 shadow-xl">
          <img
            src={aboutData.professorImage}
            alt={aboutData.quoteAuthor}
            className="h-[280px] sm:h-[360px] md:h-[480px] lg:h-[540px] w-full object-cover opacity-80"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1400x800/1a1a1a/ffffff?text=Prof.+Márcio+Tubarão'
            }}
          />

          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />

          <div className="relative md:absolute md:inset-0 md:flex md:items-center">
            <div className="w-full max-w-2xl bg-black/70 p-5 text-white sm:p-6 md:bg-transparent md:px-8 md:py-0 lg:px-10">
              <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-semibold italic leading-relaxed">
                "{aboutData.quote}"
              </blockquote>
              <p className="mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-white/85 font-medium">
                — {aboutData.quoteAuthor}
              </p>

              <div className="mt-4 space-y-3 text-xs sm:text-sm md:text-base lg:text-lg text-white/90 leading-relaxed">
                <p>{aboutData.description}</p>
                <p>{aboutData.gfteamAffiliation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
