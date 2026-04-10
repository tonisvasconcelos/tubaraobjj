import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBranches } from '../services/publicApi'
import { Car, MapPin, Navigation } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../i18n/LanguageProvider'
import Seo from '../components/seo/Seo'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const RIO_DE_JANEIRO_CENTER = [-22.9068, -43.1729]

function BranchesFitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true })
      return
    }
    map.fitBounds(points, { padding: [36, 36], maxZoom: 15 })
  }, [map, points])

  return null
}

function toValidCoordinatePair(branch) {
  const latitude = Number(branch?.latitude)
  const longitude = Number(branch?.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90) return null
  if (longitude < -180 || longitude > 180) return null
  return [latitude, longitude]
}

export default function AddressesPage() {
  const { t } = useLanguage()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [directionsLoadingBranchId, setDirectionsLoadingBranchId] = useState(null)
  const [directionsHint, setDirectionsHint] = useState('')

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch(() => setBranches([]))
      .finally(() => setLoading(false))
  }, [])

  const branchesWithCoordinates = useMemo(
    () =>
      branches
        .map((branch) => ({
          ...branch,
          coordinates: toValidCoordinatePair(branch),
        }))
        .filter((branch) => Array.isArray(branch.coordinates)),
    [branches]
  )

  const branchesWithoutCoordinates = useMemo(
    () => branches.filter((branch) => !toValidCoordinatePair(branch)),
    [branches]
  )

  const mapPoints = useMemo(
    () => branchesWithCoordinates.map((branch) => branch.coordinates),
    [branchesWithCoordinates]
  )

  const openDirections = useCallback(
    (branch) => {
      if (!branch?.address) return
      const destination = encodeURIComponent(branch.address)
      const fallback = () => {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
          '_blank',
          'noopener,noreferrer'
        )
      }
      setDirectionsHint('')
      if (!navigator.geolocation) {
        setDirectionsHint(t('addresses.directionsUnavailable'))
        fallback()
        return
      }

      setDirectionsLoadingBranchId(branch.id)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}`,
            '_blank',
            'noopener,noreferrer'
          )
          setDirectionsLoadingBranchId(null)
        },
        () => {
          setDirectionsLoadingBranchId(null)
          setDirectionsHint(t('addresses.directionsDenied'))
          fallback()
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 }
      )
    },
    [t]
  )

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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-4">
            {t('addresses.title')}
          </h1>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-10">{t('addresses.mapSubtitle')}</p>

          {loading ? (
            <p className="text-center text-slate-600">{t('addresses.loading')}</p>
          ) : branches.length === 0 ? (
            <p className="text-center text-slate-600 max-w-2xl mx-auto">{t('addresses.empty')}</p>
          ) : (
            <div className="space-y-8">
              {branchesWithCoordinates.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-white/40 shadow-md bg-white/70 backdrop-blur-sm">
                  <MapContainer
                    center={RIO_DE_JANEIRO_CENTER}
                    zoom={12}
                    scrollWheelZoom
                    className="h-[440px] sm:h-[500px] w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <BranchesFitBounds points={mapPoints} />
                    {branchesWithCoordinates.map((branch) => (
                      <Marker key={branch.id} position={branch.coordinates}>
                        <Popup>
                          <div className="min-w-[220px] space-y-2">
                            <h2 className="text-base font-semibold text-slate-900">{branch.name}</h2>
                            <p className="text-sm text-slate-700 leading-relaxed">{branch.address}</p>
                            {branch.has_parking ? (
                              <div className="text-xs text-slate-700 rounded-md bg-slate-100 px-2 py-1">
                                <strong>{branch.parking_address?.trim() ? t('addresses.parkingNear') : t('addresses.parkingYes')}</strong>
                                {branch.parking_address?.trim() ? `: ${branch.parking_address.trim()}` : ''}
                              </div>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => openDirections(branch)}
                              disabled={directionsLoadingBranchId === branch.id}
                              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                            >
                              <Navigation className="w-4 h-4" aria-hidden />
                              {directionsLoadingBranchId === branch.id
                                ? t('addresses.directionsLoading')
                                : t('addresses.directionsButton')}
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              ) : (
                <p className="text-center text-slate-600">{t('addresses.noMapPoints')}</p>
              )}

              {directionsHint ? <p className="text-center text-sm text-amber-800">{directionsHint}</p> : null}

              {branchesWithoutCoordinates.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">{t('addresses.withoutCoordinatesTitle')}</h2>
                  <p className="text-sm text-slate-600">{t('addresses.withoutCoordinatesHint')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {branchesWithoutCoordinates.map((branch) => (
                      <article
                        key={branch.id}
                        className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md overflow-hidden"
                      >
                        {branch.photo_url ? (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={branch.photo_url}
                              alt={branch.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                          <div className="mt-2 flex items-start gap-2 text-slate-600">
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
                          <button
                            type="button"
                            onClick={() => openDirections(branch)}
                            disabled={directionsLoadingBranchId === branch.id}
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                          >
                            <Navigation className="w-4 h-4" aria-hidden />
                            {directionsLoadingBranchId === branch.id
                              ? t('addresses.directionsLoading')
                              : t('addresses.directionsButton')}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
