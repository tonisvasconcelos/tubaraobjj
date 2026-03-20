import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || 'tubaraobjj'

function isConfiguredValue(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return false
  // Ignore common placeholder values often left in env templates.
  return !/^your[_-]/i.test(normalized)
}

const hasCloudinaryConfig =
  isConfiguredValue(process.env.CLOUDINARY_CLOUD_NAME) &&
  isConfiguredValue(process.env.CLOUDINARY_API_KEY) &&
  isConfiguredValue(process.env.CLOUDINARY_API_SECRET)

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|png|gif|webp)/
    if (allowed.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only images (jpeg, png, gif, webp) are allowed'), false)
    }
  },
})

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result?.secure_url || '')
        }
      }
    )
    stream.end(file.buffer)
  })
}

async function uploadLocally(file) {
  await fs.promises.mkdir(uploadDir, { recursive: true })
  const ext = path.extname(file.originalname) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
  const target = path.join(uploadDir, filename)
  await fs.promises.writeFile(target, file.buffer)
  const base = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '')
  return base ? `${base}/uploads/${filename}` : `/uploads/${filename}`
}

export async function saveUpload(file) {
  if (!file) {
    throw new Error('No file provided')
  }
  if (hasCloudinaryConfig) {
    try {
      return await uploadToCloudinary(file)
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage:', err?.message || err)
    }
  }
  return uploadLocally(file)
}
