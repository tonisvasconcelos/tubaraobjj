import { SITE_ORIGIN, absolutePublicUrl, canonicalUrlForPathname, DEFAULT_OG_IMAGE_PATH } from './siteConfig'

/** Stable @id for linking WebSite.publisher to Organization */
export function organizationId() {
  return `${SITE_ORIGIN}/#organization`
}

/**
 * Organization / gym structured data (matches public footer contact intent).
 */
export function getOrganizationSchema() {
  const url = canonicalUrlForPathname('/')
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': organizationId(),
    name: 'GFTeam Tubarão',
    url,
    image: absolutePublicUrl(DEFAULT_OG_IMAGE_PATH),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Teodoro da Silva 725, Vila Isabel',
      addressLocality: 'Rio de Janeiro',
      addressRegion: 'RJ',
      addressCountry: 'BR',
    },
    telephone: '+55-21-1234-5678',
    sameAs: [
      'https://instagram.com/gfteamtubarao',
      'https://facebook.com/gfteamtubarao',
    ],
  }
}

/**
 * WebSite schema for the home page (optional reference to publisher).
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GFTeam Tubarão',
    url: canonicalUrlForPathname('/'),
    inLanguage: 'pt-BR',
    publisher: { '@id': organizationId() },
  }
}
