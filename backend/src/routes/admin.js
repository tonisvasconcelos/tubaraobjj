import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload, saveUpload } from '../middleware/upload.js'

const router = express.Router()
router.use(authMiddleware)
const isProduction = process.env.NODE_ENV === 'production'

function isValidUploadUrl(url) {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false

  // In production we only accept absolute HTTPS URLs.
  if (isProduction) {
    try {
      const parsed = new URL(trimmed)
      return parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  if (trimmed.startsWith('/uploads/')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function parseCoordinate(value, { min, max, label }) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new Error(`${label} inválida`)
  }
  return Number(num.toFixed(6))
}

function parseOptionalId(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN
}

function normalizeEmail(value, { required = false } = {}) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) {
    if (required) throw new Error('E-mail é obrigatório')
    return null
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('E-mail inválido')
  }
  return normalized.slice(0, 255)
}

function normalizeInstagramHandle(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  let handle = raw
  if (handle.startsWith('http://') || handle.startsWith('https://')) {
    try {
      const parsed = new URL(handle)
      const parts = parsed.pathname.split('/').filter(Boolean)
      handle = parts[0] || ''
    } catch {
      /* keep raw as fallback */
    }
  }
  handle = handle.replace(/^@+/, '').trim().toLowerCase()
  handle = handle.replace(/[^a-z0-9._]/g, '')
  if (!handle) return null
  return handle.slice(0, 255)
}

const SCHEDULE_TARGET_PUBLIC = new Set(['unisex', 'female_only'])

function normalizeTargetPublic(value) {
  if (value === null || value === undefined || value === '') return 'unisex'
  const v = String(value).trim()
  if (!SCHEDULE_TARGET_PUBLIC.has(v)) {
    throw new Error('target_public inválido (use unisex ou female_only)')
  }
  return v
}

// ----- Upload (single image) -----
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }
    const url = await saveUpload(req.file)
    if (!isValidUploadUrl(url)) {
      return res.status(500).json({ error: 'URL de upload inválida gerada pelo servidor' })
    }
    return res.json({ url })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha no upload' })
  }
})

// ----- Training schedules (Horários) -----
router.get('/academy-settings', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, business_name, main_contact_email, logo_url
       FROM academy_settings
       ORDER BY id ASC
       LIMIT 1`
    )
    if (result.rows.length > 0) return res.json(result.rows[0])
    const inserted = await pool.query(
      `INSERT INTO academy_settings (business_name, main_contact_email, logo_url)
       VALUES ($1, $2, $3)
       RETURNING id, business_name, main_contact_email, logo_url`,
      ['GFTeam Tubarão', null, null]
    )
    res.json(inserted.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/academy-settings', async (req, res) => {
  try {
    const businessName = String(req.body?.business_name || '').trim().slice(0, 255) || null
    let mainContactEmail
    const logoUrl = req.body?.logo_url ? String(req.body.logo_url).trim().slice(0, 1024) : null
    try {
      mainContactEmail = normalizeEmail(req.body?.main_contact_email)
    } catch (error) {
      return res.status(400).json({ error: error.message || 'E-mail inválido' })
    }
    const upsert = await pool.query(
      `INSERT INTO academy_settings (id, business_name, main_contact_email, logo_url)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id)
       DO UPDATE SET business_name = EXCLUDED.business_name,
                     main_contact_email = EXCLUDED.main_contact_email,
                     logo_url = EXCLUDED.logo_url,
                     updated_at = NOW()
       RETURNING id, business_name, main_contact_email, logo_url`,
      [businessName, mainContactEmail, logoUrl]
    )
    res.json(upsert.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ----- Training schedules (Horários) -----
router.get('/schedules', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT ts.*, tm.name AS team_member_name, tm.role AS team_member_role, tm.photo_url AS team_member_photo_url
       FROM training_schedules ts
       LEFT JOIN team_members tm ON tm.id = ts.team_member_id
       ORDER BY ts.branch_name ASC, ts.day_of_week ASC, ts.start_time ASC, ts.sort_order ASC, ts.id ASC`
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/schedules', async (req, res) => {
  try {
    const {
      branch_name,
      training_type,
      day_of_week,
      start_time,
      end_time,
      notes,
      sort_order,
      is_published,
      team_member_id,
      target_public,
    } =
      req.body || {}
    const day = parseInt(day_of_week, 10)
    if (Number.isNaN(day) || day < 0 || day > 6) {
      return res.status(400).json({ error: 'day_of_week deve ser 0 (domingo) a 6 (sábado)' })
    }
    const teamMemberId = parseOptionalId(team_member_id)
    if (Number.isNaN(teamMemberId)) {
      return res.status(400).json({ error: 'team_member_id inválido' })
    }
    if (teamMemberId != null) {
      const tm = await pool.query('SELECT id FROM team_members WHERE id = $1', [teamMemberId])
      if (tm.rows.length === 0) {
        return res.status(400).json({ error: 'Professor responsável não encontrado' })
      }
    }
    let targetPublic
    try {
      targetPublic = normalizeTargetPublic(target_public)
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
    const r = await pool.query(
      `INSERT INTO training_schedules (branch_name, training_type, day_of_week, start_time, end_time, notes, sort_order, is_published, team_member_id, target_public)
       VALUES ($1, $2, $3, $4::time, $5::time, $6, $7, $8, $9, $10) RETURNING *`,
      [
        branch_name || '',
        training_type || '',
        day,
        start_time || '00:00',
        end_time || '00:00',
        notes || null,
        sort_order ?? 0,
        is_published !== false,
        teamMemberId,
        targetPublic,
      ]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/schedules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const {
      branch_name,
      training_type,
      day_of_week,
      start_time,
      end_time,
      notes,
      sort_order,
      is_published,
      team_member_id,
      target_public,
    } =
      req.body || {}
    const day = parseInt(day_of_week, 10)
    if (Number.isNaN(day) || day < 0 || day > 6) {
      return res.status(400).json({ error: 'day_of_week deve ser 0 (domingo) a 6 (sábado)' })
    }
    const teamMemberId = parseOptionalId(team_member_id)
    if (Number.isNaN(teamMemberId)) {
      return res.status(400).json({ error: 'team_member_id inválido' })
    }
    if (teamMemberId != null) {
      const tm = await pool.query('SELECT id FROM team_members WHERE id = $1', [teamMemberId])
      if (tm.rows.length === 0) {
        return res.status(400).json({ error: 'Professor responsável não encontrado' })
      }
    }
    let targetPublic
    try {
      targetPublic = normalizeTargetPublic(target_public)
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
    const r = await pool.query(
      `UPDATE training_schedules SET branch_name = $1, training_type = $2, day_of_week = $3,
       start_time = $4::time, end_time = $5::time, notes = $6, sort_order = $7, is_published = $8,
       team_member_id = $9, target_public = $10, updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [
        branch_name ?? '',
        training_type ?? '',
        day,
        start_time ?? '00:00',
        end_time ?? '00:00',
        notes ?? null,
        sort_order ?? 0,
        is_published !== false,
        teamMemberId,
        targetPublic,
        id,
      ]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.delete('/schedules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('DELETE FROM training_schedules WHERE id = $1 RETURNING id', [id])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ----- Team members -----
router.get('/team-members', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC')
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/team-members', async (req, res) => {
  try {
    const { name, role, email, bio, photo_url, sort_order, is_published } = req.body || {}
    let emailNormalized
    try {
      emailNormalized = normalizeEmail(email)
    } catch (error) {
      return res.status(400).json({ error: error.message || 'E-mail inválido' })
    }
    const r = await pool.query(
      `INSERT INTO team_members (name, role, email, bio, photo_url, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        name || '',
        role || '',
        emailNormalized,
        bio || null,
        photo_url || null,
        sort_order ?? 0,
        is_published !== false,
      ]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/team-members/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { name, role, email, bio, photo_url, sort_order, is_published } = req.body || {}
    let emailNormalized
    try {
      emailNormalized = normalizeEmail(email)
    } catch (error) {
      return res.status(400).json({ error: error.message || 'E-mail inválido' })
    }
    const r = await pool.query(
      `UPDATE team_members SET name = $1, role = $2, email = $3, bio = $4, photo_url = $5, sort_order = $6, is_published = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [
        name ?? '',
        role ?? '',
        emailNormalized,
        bio ?? null,
        photo_url ?? null,
        sort_order ?? 0,
        is_published !== false,
        id,
      ]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.delete('/team-members/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING id', [id])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ----- Branches -----
router.get('/branches', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM branches ORDER BY sort_order ASC, id ASC')
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/branches', async (req, res) => {
  try {
    const { name, address, instagram_handle, photo_url, sort_order, is_published, has_parking, parking_address, latitude, longitude } = req.body || {}
    let lat = null
    let lng = null
    try {
      lat = parseCoordinate(latitude, { min: -90, max: 90, label: 'Latitude' })
      lng = parseCoordinate(longitude, { min: -180, max: 180, label: 'Longitude' })
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Coordenadas inválidas' })
    }
    const hp = Boolean(has_parking)
    const pa = hp && parking_address ? String(parking_address).trim() : null
    const instagramHandle = normalizeInstagramHandle(instagram_handle)
    const r = await pool.query(
      `INSERT INTO branches (name, address, instagram_handle, photo_url, sort_order, is_published, has_parking, parking_address, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name || '', address || '', instagramHandle, photo_url || null, sort_order ?? 0, is_published !== false, hp, pa, lat, lng]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/branches/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { name, address, instagram_handle, photo_url, sort_order, is_published, has_parking, parking_address, latitude, longitude } = req.body || {}
    let lat = null
    let lng = null
    try {
      lat = parseCoordinate(latitude, { min: -90, max: 90, label: 'Latitude' })
      lng = parseCoordinate(longitude, { min: -180, max: 180, label: 'Longitude' })
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Coordenadas inválidas' })
    }
    const hp = Boolean(has_parking)
    const pa = hp && parking_address ? String(parking_address).trim() : null
    const instagramHandle = normalizeInstagramHandle(instagram_handle)
    const r = await pool.query(
      `UPDATE branches SET name = $1, address = $2, instagram_handle = $3, photo_url = $4, sort_order = $5, is_published = $6,
       has_parking = $7, parking_address = $8, latitude = $9, longitude = $10, updated_at = NOW() WHERE id = $11 RETURNING *`,
      [name ?? '', address ?? '', instagramHandle, photo_url ?? null, sort_order ?? 0, is_published !== false, hp, pa, lat, lng, id]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.delete('/branches/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('DELETE FROM branches WHERE id = $1 RETURNING id', [id])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ----- Products + variants -----
router.get('/products', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM products ORDER BY sort_order ASC, id ASC')
    const products = r.rows
    const v = await pool.query('SELECT * FROM product_variants ORDER BY product_id, id')
    const byP = {}
    v.rows.forEach((row) => {
      if (!byP[row.product_id]) byP[row.product_id] = []
      byP[row.product_id].push(row)
    })
    products.forEach((p) => { p.variants = byP[p.id] || [] })
    res.json(products)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/products', async (req, res) => {
  try {
    const { name, description, image_url, price, whatsapp_link, sort_order, is_published, variants } = req.body || {}
    const r = await pool.query(
      `INSERT INTO products (name, description, image_url, price, whatsapp_link, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name || '', description || null, image_url || null, price ?? 0, whatsapp_link || null, sort_order ?? 0, is_published !== false]
    )
    const product = r.rows[0]
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await pool.query(
          'INSERT INTO product_variants (product_id, color, size, stock_quantity) VALUES ($1, $2, $3, $4)',
          [product.id, v.color || null, v.size || null, v.stock_quantity ?? 0]
        )
      }
    }
    const v = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id])
    product.variants = v.rows
    res.status(201).json(product)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { name, description, image_url, price, whatsapp_link, sort_order, is_published, variants } = req.body || {}
    const r = await pool.query(
      `UPDATE products SET name = $1, description = $2, image_url = $3, price = $4, whatsapp_link = $5, sort_order = $6, is_published = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name ?? '', description ?? null, image_url ?? null, price ?? 0, whatsapp_link ?? null, sort_order ?? 0, is_published !== false, id]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    const product = r.rows[0]
    if (Array.isArray(variants)) {
      await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id])
      for (const v of variants) {
        await pool.query(
          'INSERT INTO product_variants (product_id, color, size, stock_quantity) VALUES ($1, $2, $3, $4)',
          [id, v.color || null, v.size || null, v.stock_quantity ?? 0]
        )
      }
    }
    const v = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [id])
    product.variants = v.rows
    res.json(product)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ----- Contacts -----
router.get('/contacts', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC')
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.patch('/contacts/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('UPDATE contacts SET read_at = NOW() WHERE id = $1 RETURNING *', [id])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

// ----- Highlights -----
router.get('/highlights', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM highlights ORDER BY sort_order ASC, id ASC')
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/highlights', async (req, res) => {
  try {
    const { type, title, content, image_url, author, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `INSERT INTO highlights (type, title, content, image_url, author, sort_order, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [type || 'News', title || '', content || null, image_url || null, author || null, sort_order ?? 0, is_published !== false]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/highlights/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { type, title, content, image_url, author, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `UPDATE highlights SET type = $1, title = $2, content = $3, image_url = $4, author = $5, sort_order = $6, is_published = $7, updated_at = NOW() WHERE id = $8 RETURNING *`,
      [type ?? 'News', title ?? '', content ?? null, image_url ?? null, author ?? null, sort_order ?? 0, is_published !== false, id]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.delete('/highlights/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('DELETE FROM highlights WHERE id = $1 RETURNING id', [id])
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router
