import { useState, useEffect } from 'react'
import { getGallery } from '../services/publicApi'
import { useLanguage } from '../i18n/LanguageProvider'

const GALLERY_CATEGORIES = ['training', 'competition', 'event']

export default function GalleryPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getGallery()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-8">
          {t('gallery.title')}
        </h1>
        {loading ? (
          <p className="text-center text-slate-600">{t('gallery.loading')}</p>
        ) : items.length === 0 ? (
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            {t('gallery.empty')}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white/60 text-slate-700 hover:bg-white/80'}`}
              >
                {t('gallery.filterAll')}
              </button>
              {GALLERY_CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === value ? 'bg-slate-900 text-white' : 'bg-white/60 text-slate-700 hover:bg-white/80'}`}
                >
                  {t(`gallery.cat.${value}`)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.image_url}
                    alt={item.title || t('gallery.alt')}
                    className="w-full h-full object-cover"
                  />
                  {item.title && (
                    <p className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-sm truncate">
                      {item.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
