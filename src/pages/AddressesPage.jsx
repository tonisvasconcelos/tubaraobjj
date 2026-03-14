import { useState, useEffect } from 'react'
import { getBranches } from '../services/publicApi'
import { MapPin } from 'lucide-react'

export default function AddressesPage() {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch(() => setBranches([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12">
          Unidades
        </h1>
        {loading ? (
          <p className="text-center text-slate-600">Carregando...</p>
        ) : branches.length === 0 ? (
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            Vila Isabel (Sede) e Tijuca. Endereços e fotos em breve.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {branches.map((branch) => (
              <article
                key={branch.id}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                {branch.photo_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={branch.photo_url}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900">{branch.name}</h2>
                  <div className="mt-3 flex items-start gap-2 text-slate-600">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{branch.address}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
