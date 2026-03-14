import express from 'express'
import pool from '../db/pool.js'

const router = express.Router()

router.get('/team-members', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, role, bio, photo_url, sort_order FROM team_members WHERE is_published = true ORDER BY sort_order ASC, id ASC'
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.get('/branches', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, address, photo_url, sort_order FROM branches WHERE is_published = true ORDER BY sort_order ASC, id ASC'
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.get('/products', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, description, image_url, price, whatsapp_link, sort_order FROM products WHERE is_published = true ORDER BY sort_order ASC, id ASC'
    )
    const products = r.rows
    const variants = await pool.query(
      'SELECT id, product_id, color, size, stock_quantity FROM product_variants'
    )
    const byProduct = {}
    for (const v of variants.rows) {
      if (!byProduct[v.product_id]) byProduct[v.product_id] = []
      byProduct[v.product_id].push(v)
    }
    products.forEach((p) => {
      p.variants = byProduct[p.id] || []
    })
    res.json(products)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.get('/gallery', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, title, image_url, category, sort_order FROM gallery_items WHERE is_published = true ORDER BY sort_order ASC, created_at DESC'
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.get('/highlights', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, type, title, content, image_url, author, sort_order FROM highlights WHERE is_published = true ORDER BY sort_order ASC, id ASC'
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

router.post('/contacts', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {}
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' })
    }
    await pool.query(
      'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)',
      [String(name).trim().slice(0, 255), String(email).trim().slice(0, 255), phone ? String(phone).trim().slice(0, 100) : null, String(message).trim().slice(0, 5000)]
    )
    res.status(201).json({ message: 'Mensagem enviada com sucesso' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

export default router
