import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    cb(null, name)
  },
})

export const upload = multer({
  storage,
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

export function getUploadUrl(filename) {
  const base = (process.env.API_PUBLIC_URL || '').replace(/\/$/, '')
  return base ? `${base}/uploads/${filename}` : `/uploads/${filename}`
}
