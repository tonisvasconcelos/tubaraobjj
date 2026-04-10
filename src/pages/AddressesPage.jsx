import { useState, useEffect } from 'react'
import { getBranches } from '../services/publicApi'
import { Car, MapPin } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import Seo from '../components/seo/Seo'

export default function AddressesPage() {
  const { t } = useLanguage()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch(() => setBranches([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Seo
        title="Unidades e endereços — GFTeam Tubarão"
        description="Onde treinar: unidades e endereços da GFTeam Tubarão no Rio de Janeiro. Encontre a academia mais próxima e venha conhecer nossas aulas de Jiu-Jitsu."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Unidades', path: '/addresses' },
        ]}
      />
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12">
          {t('addresses.title')}
        </h1>
        {loading ? (
          <p className="text-center text-slate-600">{t('addresses.loading')}</p>
        ) : branches.length === 0 ? (
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            {t('addresses.empty')}
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
                      loading="lazy"
                      decoding="async"
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
                  {branch.has_parking ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <Car className="w-4 h-4 flex-shrink-0" aria-hidden />
                        {branch.parking_address?.trim()
                          ? t('addresses.parkingNear')
                          : t('addresses.parkingYes')}
                      </div>
                      {branch.parking_address?.trim() ? (
                        <p className="mt-1 text-slate-600 leading-relaxed">{branch.parking_address.trim()}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  )
}
