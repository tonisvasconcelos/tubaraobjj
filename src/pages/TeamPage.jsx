import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { getTeamMembers } from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'
import Seo from '../components/seo/Seo'

export default function TeamPage() {
  const { t } = useLanguage()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMemberIds, setExpandedMemberIds] = useState({})

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  function toggleMemberBio(memberId) {
    setExpandedMemberIds((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }))
  }

  return (
    <>
      <Seo
        title="Equipe e professores — GFTeam Tubarão"
        description="Conheça a equipe da GFTeam Tubarão: professores e instrutores de Jiu-Jitsu no Rio de Janeiro. Experiência, graduações e aulas para todos os níveis."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Equipe', path: '/team' },
        ]}
      />
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12">
          {t('team.title')}
        </h1>
        {loading ? (
          <p className="text-center text-slate-600">{t('team.loading')}</p>
        ) : members.length === 0 ? (
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            {t('team.empty')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {members.map((member) => {
              const isExpanded = Boolean(expandedMemberIds[member.id])
              const bioId = `team-bio-${member.id}`

              return (
                <article
                  key={member.id}
                  className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  {member.photo_url && (
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                    <p className="text-slate-600 font-medium mt-1">{member.role}</p>
                    <div className="mt-3">
                      <Link
                        to={`/horarios?teacher=${member.id}`}
                        className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        {t('team.seeAgenda')}
                      </Link>
                    </div>

                    {member.bio && (
                      <>
                        {/* Desktop/tablet: keep full bio always visible */}
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap hidden md:block">
                          {member.bio}
                        </p>

                        {/* Mobile: collapsed by default, expandable via arrow button */}
                        <button
                          type="button"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-700 md:hidden"
                          aria-expanded={isExpanded}
                          aria-controls={bioId}
                          onClick={() => toggleMemberBio(member.id)}
                        >
                          <span>{isExpanded ? t('team.hideDescription') : t('team.showDescription')}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isExpanded && (
                          <p
                            id={bioId}
                            className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap md:hidden"
                          >
                            {member.bio}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
    </>
  )
}
