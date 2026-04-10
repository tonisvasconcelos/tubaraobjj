import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const projectRoot = process.cwd()
const imagesRoot = path.join(projectRoot, 'public', 'images')
const outputRoot = path.join(imagesRoot, 'optimized')

const imageJobs = [
  {
    id: 'hero-team',
    input: 'Marcio Tubarão2.JPG',
    widths: [640, 960, 1280, 1600],
  },
  {
    id: 'hero-branches',
    input: 'UnidadeTijuca2.PNG',
    widths: [640, 960, 1280, 1600],
  },
  {
    id: 'hero-store',
    input: 'ChatGPT Image 16 de jan. de 2026, 13_52_44.png',
    widths: [640, 960, 1280, 1600],
  },
  {
    id: 'programme-main',
    input: 'IMG_7444.JPG',
    widths: [480, 768, 1024, 1366],
  },
  {
    id: 'programme-couple',
    input: 'Nogi.PNG',
    widths: [480, 768, 1024, 1366],
  },
  {
    id: 'programme-fem',
    input: 'TubaFem.jpg',
    widths: [480, 768, 1024, 1366],
  },
  {
    id: 'programme-kids',
    input: 'Kids.png',
    widths: [480, 768, 1024, 1366],
  },
  {
    id: 'about-marcio',
    input: 'Tuba Coach.JPG',
    widths: [640, 960, 1280, 1600],
  },
]

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function createVariants(job) {
  const sourcePath = path.join(imagesRoot, job.input)

  for (const width of job.widths) {
    const webpPath = path.join(outputRoot, `${job.id}-${width}.webp`)
    const jpgPath = path.join(outputRoot, `${job.id}-${width}.jpg`)

    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(webpPath)

    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(jpgPath)
  }
}

async function run() {
  await ensureDir(outputRoot)

  for (const job of imageJobs) {
    await createVariants(job)
  }

  console.log(`Generated responsive images in ${outputRoot}`)
}

run().catch((error) => {
  console.error('Failed to generate responsive media', error)
  process.exitCode = 1
})
