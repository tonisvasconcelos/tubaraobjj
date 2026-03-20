import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload, saveUpload } from '../middleware/upload.js'

const router = express.Router()
router.use(authMiddleware)

// ----- Upload (single image) -----
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }
    const url = await saveUpload(req.file)
    return res.json({ url })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha no upload' })
  }
})

// ----- Training schedules (Horários) -----
router.get('/schedules', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM training_schedules ORDER BY branch_name ASC, day_of_week ASC, start_time ASC, sort_order ASC, id ASC'
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/schedules', async (req, res) => {
  try {
    const { branch_name, training_type, day_of_week, start_time, end_time, notes, sort_order, is_published } =
      req.body || {}
    const day = parseInt(day_of_week, 10)
    if (Number.isNaN(day) || day < 0 || day > 6) {
      return res.status(400).json({ error: 'day_of_week deve ser 0 (domingo) a 6 (sábado)' })
    }
    const r = await pool.query(
      `INSERT INTO training_schedules (branch_name, training_type, day_of_week, start_time, end_time, notes, sort_order, is_published)
       VALUES ($1, $2, $3, $4::time, $5::time, $6, $7, $8) RETURNING *`,
      [
        branch_name || '',
        training_type || '',
        day,
        start_time || '00:00',
        end_time || '00:00',
        notes || null,
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

router.put('/schedules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { branch_name, training_type, day_of_week, start_time, end_time, notes, sort_order, is_published } =
      req.body || {}
    const day = parseInt(day_of_week, 10)
    if (Number.isNaN(day) || day < 0 || day > 6) {
      return res.status(400).json({ error: 'day_of_week deve ser 0 (domingo) a 6 (sábado)' })
    }
    const r = await pool.query(
      `UPDATE training_schedules SET branch_name = $1, training_type = $2, day_of_week = $3,
       start_time = $4::time, end_time = $5::time, notes = $6, sort_order = $7, is_published = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        branch_name ?? '',
        training_type ?? '',
        day,
        start_time ?? '00:00',
        end_time ?? '00:00',
        notes ?? null,
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
    const { name, role, bio, photo_url, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `INSERT INTO team_members (name, role, bio, photo_url, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name || '', role || '', bio || null, photo_url || null, sort_order ?? 0, is_published !== false]
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
    const { name, role, bio, photo_url, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `UPDATE team_members SET name = $1, role = $2, bio = $3, photo_url = $4, sort_order = $5, is_published = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name ?? '', role ?? '', bio ?? null, photo_url ?? null, sort_order ?? 0, is_published !== false, id]
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
    const { name, address, photo_url, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `INSERT INTO branches (name, address, photo_url, sort_order, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name || '', address || '', photo_url || null, sort_order ?? 0, is_published !== false]
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
    const { name, address, photo_url, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `UPDATE branches SET name = $1, address = $2, photo_url = $3, sort_order = $4, is_published = $5, updated_at = NOW() WHERE id = $6 RETURNING *`,
      [name ?? '', address ?? '', photo_url ?? null, sort_order ?? 0, is_published !== false, id]
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

// ----- Gallery -----
router.get('/gallery', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC')
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/gallery', async (req, res) => {
  try {
    const { title, image_url, category, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `INSERT INTO gallery_items (title, image_url, category, sort_order, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title || null, image_url || '', category || 'training', sort_order ?? 0, is_published !== false]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.put('/gallery/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { title, image_url, category, sort_order, is_published } = req.body || {}
    const r = await pool.query(
      `UPDATE gallery_items SET title = $1, image_url = $2, category = $3, sort_order = $4, is_published = $5, updated_at = NOW() WHERE id = $6 RETURNING *`,
      [title ?? null, image_url ?? '', category ?? 'training', sort_order ?? 0, is_published !== false, id]
    )
    if (r.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.delete('/gallery/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const r = await pool.query('DELETE FROM gallery_items WHERE id = $1 RETURNING id', [id])
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
