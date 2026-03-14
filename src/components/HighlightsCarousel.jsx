import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { getHighlights } from '../services/publicApi'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const HighlightsCarousel = () => {
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHighlights()
      .then((data) => setHighlights(Array.isArray(data) ? data : []))
      .catch(() => setHighlights([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || highlights.length === 0) return null

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white/55 backdrop-blur-[2px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-dark mb-12 sm:mb-16">
          Destaques
        </h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 30,
            },
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          className="pb-12"
        >
          {highlights.map((highlight) => (
            <SwiperSlide key={highlight.id}>
              <div className="bg-white/65 backdrop-blur-md rounded-lg overflow-hidden shadow-md border border-white/40 h-full hover:shadow-lg transition-all duration-300">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={highlight.image_url || ''}
                    alt={highlight.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x450/1a1a1a/ffffff?text=' + encodeURIComponent(highlight.title)
                    }}
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {highlight.type}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
                    {highlight.title}
                  </h3>
                  {highlight.content && (
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-4 leading-relaxed">
                      {highlight.content}
                    </p>
                  )}
                  {highlight.author && (
                    <p className="text-sm sm:text-base text-slate-500 font-medium">
                      — {highlight.author}
                    </p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button type="button" className="swiper-button-prev-custom w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-dark hover:bg-dark-gray text-white rounded-full flex items-center justify-center transition-colors duration-200">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button type="button" className="swiper-button-next-custom w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-dark hover:bg-dark-gray text-white rounded-full flex items-center justify-center transition-colors duration-200">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HighlightsCarousel
