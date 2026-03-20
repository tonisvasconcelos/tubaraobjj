import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import cors from 'cors'
import multer from 'multer'
import pool from './db/pool.js'
import authRoutes from './routes/auth.js'
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')
const port = parseInt(process.env.PORT || '4000', 10)

const app = express()

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: corsOrigin.split(',').map((o) => o.trim()), credentials: true }))
app.use(express.json())

try {
  fs.mkdirSync(uploadDir, { recursive: true })
} catch (_) {}
app.use('/uploads', express.static(uploadDir))

app.use('/api/auth', authRoutes)
app.use('/api', publicRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'ok' })
  } catch (e) {
    console.error('Health DB check failed:', e)
    res.status(500).json({ ok: false, db: 'error' })
  }
})

app.use((err, req, res, next) => {
  console.error(err)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Arquivo muito grande (máx. 20MB)' })
    }
    return res.status(400).json({ error: err.message || 'Falha no upload' })
  }
  if (String(err?.message || '').includes('Only images')) {
    return res.status(400).json({ error: 'Somente imagens (jpeg, png, gif, webp) são permitidas' })
  }
  res.status(500).json({ error: err.message || 'Erro no servidor' })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
