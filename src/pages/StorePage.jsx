import { useState, useEffect } from 'react'
import { getProducts } from '../services/publicApi'
import { ShoppingBag } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import Seo from '../components/seo/Seo'

export default function StorePage() {
  const { lang, t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const priceLocale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US'

  const formatPrice = (n) => {
    return new Intl.NumberFormat(priceLocale, { style: 'currency', currency: 'BRL' }).format(n)
  }

  return (
    <>
      <Seo
        title="Loja — kimonos e equipamentos GFTeam Tubarão"
        description="Produtos e equipamentos da GFTeam Tubarão: kimonos, rashguards e itens da loja oficial. Compre com a equipe e treine com qualidade."
      />
    <section className="pt-16 md:pt-20 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-12">
          {t('store.title')}
        </h1>
        {loading ? (
          <p className="text-center text-slate-600">{t('store.loading')}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-slate-600 max-w-2xl mx-auto">
            {t('store.empty')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product) => (
              <article
                key={product.id}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                {product.image_url && (
                  <div className="aspect-square w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
                  {product.description && (
                    <p className="mt-2 text-slate-600 text-sm line-clamp-3">{product.description}</p>
                  )}
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formatPrice(parseFloat(product.price))}</p>
                  {product.variants && product.variants.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {t('store.variants')}:{' '}
                      {product.variants.map((v) => [v.color, v.size].filter(Boolean).join(' / ') || '—').join(' · ')}
                    </p>
                  )}
                  <a
                    href={product.whatsapp_link || 'https://wa.me/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {t('store.buyWhatsapp')}
                  </a>
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
