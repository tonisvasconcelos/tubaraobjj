import { useState, useEffect } from 'react'
import { getTeamMembers } from '../services/publicApi'

export default function TeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12">
          Equipe
        </h1>
        {loading ? (
          <p className="text-center text-slate-600">Carregando...</p>
        ) : members.length === 0 ? (
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            Conheça o Professor Márcio &quot;Tubarão&quot; e nossa equipe de instrutores. (Conteúdo em breve.)
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {members.map((member) => (
              <article
                key={member.id}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                {member.photo_url && (
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                  <p className="text-slate-600 font-medium mt-1">{member.role}</p>
                  {member.bio && (
                    <p className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {member.bio}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
