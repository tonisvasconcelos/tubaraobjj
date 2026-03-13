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
        <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-xl">
          <img
            src={aboutData.professorImage}
            alt={aboutData.quoteAuthor}
            className="h-[420px] sm:h-[480px] lg:h-[540px] w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1400x800/1a1a1a/ffffff?text=Prof.+Márcio+Tubarão'
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-2xl px-5 sm:px-8 lg:px-10">
              <blockquote className="text-xl sm:text-2xl lg:text-4xl font-semibold italic text-white leading-relaxed">
                "{aboutData.quote}"
              </blockquote>
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-white/85 font-medium">
                — {aboutData.quoteAuthor}
              </p>

              <div className="mt-5 space-y-4 text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed">
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
