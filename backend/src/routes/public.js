import express from 'express'
import pool from '../db/pool.js'
import { rateLimit } from '../middleware/rateLimit.js'

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
      `SELECT id, name, address, photo_url, sort_order, has_parking, parking_address, latitude, longitude
       FROM branches WHERE is_published = true ORDER BY sort_order ASC, id ASC`
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

router.get('/schedules', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT ts.id, ts.branch_name, ts.training_type, ts.day_of_week, ts.start_time, ts.end_time, ts.notes, ts.sort_order,
              ts.target_public, ts.team_member_id, tm.name AS team_member_name, tm.role AS team_member_role, tm.photo_url AS team_member_photo_url,
              b.instagram_handle,
              aset.logo_url AS academy_logo_url
       FROM training_schedules ts
       LEFT JOIN team_members tm ON tm.id = ts.team_member_id
       LEFT JOIN branches b ON LOWER(TRIM(b.name)) = LOWER(TRIM(ts.branch_name))
       LEFT JOIN LATERAL (
         SELECT logo_url
         FROM academy_settings
         ORDER BY id ASC
         LIMIT 1
       ) aset ON true
       WHERE ts.is_published = true
       ORDER BY ts.branch_name ASC, ts.day_of_week ASC, ts.start_time ASC, ts.sort_order ASC, ts.id ASC`
    )
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro no servidor' })
  }
})

async function createContact(req, res) {
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
}

router.post('/contacts', rateLimit({ windowMs: 60_000, max: 8 }), createContact)
router.post('/contact', rateLimit({ windowMs: 60_000, max: 8 }), createContact)

function sanitizeLocale(value) {
  const locale = String(value || 'pt-BR').trim()
  if (!locale) return 'pt-BR'
  return locale.slice(0, 10)
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  if (forwarded.length > 0) return forwarded[0].slice(0, 120)
  return String(req.ip || '').slice(0, 120)
}

router.get('/legal/active', async (req, res) => {
  try {
    const locale = sanitizeLocale(req.query.locale)
    const result = await pool.query(
      `SELECT id, term_key, locale, title, content, version, published_at
       FROM website_terms
       WHERE is_active = true
         AND (locale = $1 OR locale = 'pt-BR')
       ORDER BY CASE WHEN locale = $1 THEN 0 ELSE 1 END, term_key ASC`,
      [locale]
    )

    const dedup = new Map()
    for (const row of result.rows) {
      if (!dedup.has(row.term_key)) dedup.set(row.term_key, row)
    }
    res.json(Array.from(dedup.values()))
  } catch (error) {
    console.error('[public/legal/active]', error)
    res.status(500).json({ error: 'Erro ao carregar termos ativos' })
  }
})

router.get('/legal/:termKey', async (req, res) => {
  try {
    const termKey = String(req.params.termKey || '').trim()
    if (!termKey) return res.status(400).json({ error: 'termKey é obrigatório' })
    const locale = sanitizeLocale(req.query.locale)
    const result = await pool.query(
      `SELECT id, term_key, locale, title, content, version, published_at
       FROM website_terms
       WHERE term_key = $1
         AND is_active = true
         AND (locale = $2 OR locale = 'pt-BR')
       ORDER BY CASE WHEN locale = $2 THEN 0 ELSE 1 END
       LIMIT 1`,
      [termKey, locale]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Termo não encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('[public/legal/key]', error)
    res.status(500).json({ error: 'Erro ao carregar termo' })
  }
})

router.post('/legal/agreements', rateLimit({ windowMs: 60_000, max: 12 }), async (req, res) => {
  try {
    const { visitorId, accepted, consentScope, locale, path, terms } = req.body || {}
    if (!visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({ error: 'visitorId é obrigatório' })
    }
    if (typeof accepted !== 'boolean') {
      return res.status(400).json({ error: 'accepted inválido' })
    }
    if (!Array.isArray(terms) || terms.length === 0) {
      return res.status(400).json({ error: 'terms é obrigatório' })
    }

    const normalizedLocale = sanitizeLocale(locale)
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const term of terms) {
        const termId = Number(term?.termId)
        const termVersion = Number(term?.version)
        const termKey = String(term?.termKey || '').trim()
        if (!termKey || Number.isNaN(termVersion)) {
          await client.query('ROLLBACK')
          return res.status(400).json({ error: 'Dados de termo inválidos no payload' })
        }
        await client.query(
          `INSERT INTO website_term_acceptances (
            visitor_id, term_id, term_key, term_version, accepted, consent_scope, page_path, locale, ip, user_agent
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            visitorId.trim().slice(0, 120),
            Number.isNaN(termId) ? null : termId,
            termKey.slice(0, 40),
            termVersion,
            accepted,
            consentScope ? String(consentScope).trim().slice(0, 120) : null,
            path ? String(path).trim().slice(0, 500) : null,
            normalizedLocale,
            getClientIp(req),
            String(req.headers['user-agent'] || '').slice(0, 512),
          ]
        )
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

    res.status(201).json({ ok: true })
  } catch (error) {
    console.error('[public/legal/agreements]', error)
    res.status(500).json({ error: 'Erro ao registrar aceite' })
  }
})

router.get('/medical-questionnaire/active', async (_req, res) => {
  try {
    const template = await pool.query(
      `SELECT id, name, description, version, published_at
       FROM medical_questionnaire_templates
       WHERE is_active = true
       ORDER BY published_at DESC NULLS LAST, updated_at DESC
       LIMIT 1`
    )
    if (template.rows.length === 0) {
      return res.json({ template: null, questions: [] })
    }
    const templateId = template.rows[0].id
    const questions = await pool.query(
      `SELECT id, template_id, sort_order, question_key, label, question_type, is_required, options_json
       FROM medical_questionnaire_questions
       WHERE template_id = $1
       ORDER BY sort_order ASC, id ASC`,
      [templateId]
    )
    res.json({
      template: template.rows[0],
      questions: questions.rows,
    })
  } catch (error) {
    console.error('[public/medical-questionnaire/active]', error)
    res.status(500).json({ error: 'Erro ao carregar questionário médico ativo' })
  }
})

export default router
