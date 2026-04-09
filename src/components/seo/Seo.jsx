import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import {
  SITE_NAME_SHORT,
  absolutePublicUrl,
  canonicalUrlForPathname,
  DEFAULT_OG_IMAGE_PATH,
} from '../../seo/siteConfig'

export { canonicalUrlForPathname } from '../../seo/siteConfig'

/**
 * Per-route SEO: title, description, canonical, Open Graph, Twitter, optional JSON-LD.
 * Does not render visible UI.
 */
export default function Seo({
  title,
  description,
  ogType = 'website',
  /** Absolute URL or path under public site */
  ogImage,
  jsonLd,
  breadcrumbs = [],
}) {
  const { pathname } = useLocation()
  const canonical = canonicalUrlForPathname(pathname)
  const imageUrl =
    typeof ogImage === 'string' && (ogImage.startsWith('http://') || ogImage.startsWith('https://'))
      ? ogImage
      : absolutePublicUrl(ogImage || DEFAULT_OG_IMAGE_PATH)

  const breadcrumbLd =
    Array.isArray(breadcrumbs) && breadcrumbs.length > 0
      ? {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: canonicalUrlForPathname(crumb.path),
          })),
        }
      : null

  const ldEntries = []
  if (jsonLd != null) {
    if (Array.isArray(jsonLd)) {
      ldEntries.push(...jsonLd)
    } else {
      ldEntries.push(jsonLd)
    }
  }
  if (breadcrumbLd) ldEntries.push(breadcrumbLd)

  const ldPayload =
    ldEntries.length === 0
      ? null
      : ldEntries.length === 1 && !breadcrumbLd
        ? ldEntries[0]
        : {
            '@context': 'https://schema.org',
            '@graph': ldEntries.map((entry) => {
              const normalized = { ...entry }
              delete normalized['@context']
              return normalized
            }),
          }

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME_SHORT} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="pt_BR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {ldPayload ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldPayload) }}
        />
      ) : null}
    </Helmet>
  )
}
