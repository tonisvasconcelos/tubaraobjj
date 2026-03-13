const AboutSection = () => {
  const baseUrl = import.meta.env.BASE_URL
  const aboutData = {
    quote: 'Acreditamos no jiu-jitsu como instrumento de transformação e saúde para todos.',
    quoteAuthor: 'Prof. Márcio "Tubarão"',
    description: 'A GFTeam Tubarão é uma academia de Jiu-Jitsu dedicada a proporcionar uma experiência completa de treinamento para alunos de todas as idades e níveis. Nossa missão é desenvolver não apenas habilidades técnicas, mas também valores como disciplina, respeito e superação pessoal.',
    gfteamAffiliation: 'Fazemos parte da rede GFTeam, uma das maiores e mais respeitadas equipes de Jiu-Jitsu do mundo, garantindo metodologia de ensino de excelência e suporte técnico de alto nível.',
    // NOTE: Replace/rename this file later if desired (spaces are OK in public path)
    professorImage: `${baseUrl}images/TubaDesert.JPG`,
  }

  return (
    <section id="quem-somos" className="py-12 sm:py-16 lg:py-24 bg-white/55 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Quote and Description */}
          <div className="space-y-6">
            {/* Quote */}
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-semibold italic text-slate-900 leading-relaxed">
              "{aboutData.quote}"
            </blockquote>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500 font-medium">
              — {aboutData.quoteAuthor}
            </p>

            {/* Description */}
            <div className="space-y-4 text-base sm:text-lg lg:text-xl text-slate-700">
              <p>{aboutData.description}</p>
              <p>{aboutData.gfteamAffiliation}</p>
            </div>
          </div>

          {/* Right Column - Professor Image */}
          <div className="relative">
            <div className="aspect-[3/4] w-full max-w-md mx-auto lg:max-w-full rounded-2xl border border-slate-200 shadow-lg overflow-hidden bg-slate-100">
              <img
                src={aboutData.professorImage}
                alt={aboutData.quoteAuthor}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=Prof.+Márcio+Tubarão'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
