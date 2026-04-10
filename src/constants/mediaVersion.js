/**
 * Bump when regenerating /public/images/optimized/ hero-* (or related) assets.
 * Filenames stay the same; long-lived Cache-Control on /images/optimized/ means
 * the query string forces a fresh fetch after image swaps.
 */
export const HERO_OPTIMIZED_MEDIA_VERSION = '4'

/** Modalidades (programme-*) — bump when sources or optimized outputs change. */
export const PROGRAMMES_OPTIMIZED_MEDIA_VERSION = '2'

/** About section (about-marcio-*) — bump when source or optimized outputs change. */
export const ABOUT_MARCIO_OPTIMIZED_MEDIA_VERSION = '1'
