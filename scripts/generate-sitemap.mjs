import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_SITEMAP_ROUTES } from '../src/config/publicRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'public', 'sitemap.xml')
const siteOrigin = (process.env.VITE_SITE_URL || 'https://www.tubaraobjj.com').replace(/\/$/, '')

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function sitemapEntry(route) {
  const loc = `${siteOrigin}${route.path}`
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority}</priority>`,
    '  </url>',
  ].join('\n')
}

const body = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...PUBLIC_SITEMAP_ROUTES.map(sitemapEntry),
  '</urlset>',
  '',
].join('\n')

await fs.writeFile(outputPath, body, 'utf8')
console.log(`Generated sitemap at ${outputPath}`)
