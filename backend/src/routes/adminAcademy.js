import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/pool.js'
import { authMiddleware, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware, requireAdmin)

function toDecimalOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function toArrayJson(value) {
  if (Array.isArray(value)) return value
  return []
}

function toSlug(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ----- Students -----
router.get('/students', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, student_level, status, notes, created_at, updated_at
       FROM students
       ORDER BY created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/students/list]', error)
    res.status(500).json({ error: 'Erro ao listar alunos' })
  }
})

router.post('/students', async (req, res) => {
  try {
    const { name, email, password, phone, student_level, status, notes } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }
    const passwordHash = await bcrypt.hash(String(password), 10)
    const result = await pool.query(
      `INSERT INTO students (name, email, password_hash, phone, student_level, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, student_level, status, notes, created_at, updated_at`,
      [
        String(name).trim().slice(0, 255),
        String(email).trim().toLowerCase().slice(0, 255),
        passwordHash,
        phone ? String(phone).trim().slice(0, 100) : null,
        student_level ? String(student_level).trim().slice(0, 100) : null,
        status || 'active',
        notes ? String(notes).trim().slice(0, 3000) : null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/students/create]', error)
    if (String(error?.message || '').toLowerCase().includes('duplicate')) {
      return res.status(409).json({ error: 'Já existe aluno com este email' })
    }
    res.status(500).json({ error: 'Erro ao criar aluno' })
  }
})

router.put('/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, email, phone, student_level, status, notes } = req.body || {}
    const result = await pool.query(
      `UPDATE students
       SET name = $1, email = $2, phone = $3, student_level = $4, status = $5, notes = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, phone, student_level, status, notes, created_at, updated_at`,
      [
        String(name || '').trim().slice(0, 255),
        String(email || '').trim().toLowerCase().slice(0, 255),
        phone ? String(phone).trim().slice(0, 100) : null,
        student_level ? String(student_level).trim().slice(0, 100) : null,
        status || 'active',
        notes ? String(notes).trim().slice(0, 3000) : null,
        id,
      ]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/students/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar aluno' })
  }
})

router.delete('/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' })
    res.status(204).send()
  } catch (error) {
    console.error('[admin-academy/students/delete]', error)
    res.status(500).json({ error: 'Erro ao remover aluno' })
  }
})

router.post('/students/:id/reset-password', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { password } = req.body || {}
    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória' })
    }
    const passwordHash = await bcrypt.hash(String(password), 10)
    const result = await pool.query(
      'UPDATE students SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [passwordHash, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' })
    res.json({ ok: true })
  } catch (error) {
    console.error('[admin-academy/students/reset-password]', error)
    res.status(500).json({ error: 'Erro ao redefinir senha' })
  }
})

// ----- Plans -----
router.get('/plans', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plans ORDER BY sort_order ASC, id ASC')
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/plans/list]', error)
    res.status(500).json({ error: 'Erro ao listar planos' })
  }
})

router.post('/plans', async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      monthly_fee_brl,
      billing_cycle,
      trial_days,
      sort_order,
      is_active,
      allowed_training_days,
      allowed_training_times,
      supported_student_levels,
      allowed_branch_ids,
    } = req.body || {}
    if (!name) return res.status(400).json({ error: 'Nome do plano é obrigatório' })

    const safeSlug = toSlug(slug || name)
    const monthly = toDecimalOrNull(monthly_fee_brl) ?? 0
    const result = await pool.query(
      `INSERT INTO plans
       (name, slug, description, price, billing_cycle, trial_days, sort_order, is_active, monthly_fee_brl,
        allowed_training_days, allowed_training_times, supported_student_levels, allowed_branch_ids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
       RETURNING *`,
      [
        String(name).trim().slice(0, 255),
        safeSlug,
        description ? String(description).trim().slice(0, 5000) : null,
        monthly,
        billing_cycle || 'monthly',
        Number(trial_days) || 0,
        Number(sort_order) || 0,
        is_active !== false,
        monthly,
        allowed_training_days ? String(allowed_training_days).trim().slice(0, 400) : null,
        allowed_training_times ? String(allowed_training_times).trim().slice(0, 400) : null,
        supported_student_levels ? String(supported_student_levels).trim().slice(0, 400) : null,
        JSON.stringify(toArrayJson(allowed_branch_ids)),
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/plans/create]', error)
    res.status(500).json({ error: 'Erro ao criar plano' })
  }
})

router.put('/plans/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const {
      name,
      slug,
      description,
      monthly_fee_brl,
      billing_cycle,
      trial_days,
      sort_order,
      is_active,
      allowed_training_days,
      allowed_training_times,
      supported_student_levels,
      allowed_branch_ids,
    } = req.body || {}
    const safeSlug = toSlug(slug || name)
    const monthly = toDecimalOrNull(monthly_fee_brl) ?? 0
    const result = await pool.query(
      `UPDATE plans
       SET name = $1, slug = $2, description = $3, price = $4, billing_cycle = $5, trial_days = $6, sort_order = $7,
           is_active = $8, monthly_fee_brl = $9, allowed_training_days = $10, allowed_training_times = $11,
           supported_student_levels = $12, allowed_branch_ids = $13::jsonb, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        String(name || '').trim().slice(0, 255),
        safeSlug,
        description ? String(description).trim().slice(0, 5000) : null,
        monthly,
        billing_cycle || 'monthly',
        Number(trial_days) || 0,
        Number(sort_order) || 0,
        is_active !== false,
        monthly,
        allowed_training_days ? String(allowed_training_days).trim().slice(0, 400) : null,
        allowed_training_times ? String(allowed_training_times).trim().slice(0, 400) : null,
        supported_student_levels ? String(supported_student_levels).trim().slice(0, 400) : null,
        JSON.stringify(toArrayJson(allowed_branch_ids)),
        id,
      ]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/plans/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar plano' })
  }
})

router.delete('/plans/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' })
    res.status(204).send()
  } catch (error) {
    console.error('[admin-academy/plans/delete]', error)
    res.status(500).json({ error: 'Erro ao remover plano' })
  }
})

// ----- Plan assignments -----
router.get('/plan-assignments', async (req, res) => {
  try {
    const studentId = req.query.student_id ? Number(req.query.student_id) : null
    const params = []
    let where = ''
    if (studentId) {
      params.push(studentId)
      where = 'WHERE spa.student_id = $1'
    }
    const result = await pool.query(
      `SELECT spa.*, s.name AS student_name, s.email AS student_email, p.name AS plan_name, p.monthly_fee_brl AS plan_monthly_fee_brl
       FROM student_plan_assignments spa
       JOIN students s ON s.id = spa.student_id
       JOIN plans p ON p.id = spa.plan_id
       ${where}
       ORDER BY spa.created_at DESC`,
      params
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/assignments/list]', error)
    res.status(500).json({ error: 'Erro ao listar vínculos de plano' })
  }
})

router.post('/plan-assignments', async (req, res) => {
  try {
    const { student_id, plan_id, starts_at, ends_at, status, custom_monthly_fee_brl, notes } = req.body || {}
    if (!student_id || !plan_id) {
      return res.status(400).json({ error: 'student_id e plan_id são obrigatórios' })
    }
    const result = await pool.query(
      `INSERT INTO student_plan_assignments (student_id, plan_id, starts_at, ends_at, status, custom_monthly_fee_brl, notes)
       VALUES ($1, $2, COALESCE($3::timestamptz, NOW()), $4::timestamptz, $5, $6, $7)
       RETURNING *`,
      [
        Number(student_id),
        Number(plan_id),
        starts_at || null,
        ends_at || null,
        status || 'active',
        toDecimalOrNull(custom_monthly_fee_brl),
        notes ? String(notes).trim().slice(0, 2000) : null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/assignments/create]', error)
    res.status(500).json({ error: 'Erro ao criar vínculo de plano' })
  }
})

router.patch('/plan-assignments/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { starts_at, ends_at, status, custom_monthly_fee_brl, notes } = req.body || {}
    const result = await pool.query(
      `UPDATE student_plan_assignments
       SET starts_at = COALESCE($1::timestamptz, starts_at),
           ends_at = $2::timestamptz,
           status = COALESCE($3, status),
           custom_monthly_fee_brl = $4,
           notes = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        starts_at || null,
        ends_at || null,
        status || null,
        toDecimalOrNull(custom_monthly_fee_brl),
        notes ? String(notes).trim().slice(0, 2000) : null,
        id,
      ]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vínculo não encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/assignments/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar vínculo de plano' })
  }
})

// ----- Trial slots + reservations -----
router.get('/trial-slots', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT ts.*, b.name AS branch_name
       FROM trial_slots ts
       LEFT JOIN branches b ON b.id = ts.branch_id
       ORDER BY ts.starts_at ASC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/trial-slots/list]', error)
    res.status(500).json({ error: 'Erro ao listar horários de aula experimental' })
  }
})

router.post('/trial-slots', async (req, res) => {
  try {
    const { branch_id, title, starts_at, ends_at, capacity, is_published, is_cancelled } = req.body || {}
    if (!starts_at || !ends_at) {
      return res.status(400).json({ error: 'starts_at e ends_at são obrigatórios' })
    }
    const result = await pool.query(
      `INSERT INTO trial_slots (branch_id, title, starts_at, ends_at, capacity, is_published, is_cancelled)
       VALUES ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6, $7)
       RETURNING *`,
      [
        branch_id ? Number(branch_id) : null,
        title ? String(title).trim().slice(0, 255) : null,
        starts_at,
        ends_at,
        Math.max(Number(capacity) || 1, 1),
        is_published !== false,
        is_cancelled === true,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/trial-slots/create]', error)
    res.status(500).json({ error: 'Erro ao criar horário de aula experimental' })
  }
})

router.put('/trial-slots/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { branch_id, title, starts_at, ends_at, capacity, is_published, is_cancelled } = req.body || {}
    const result = await pool.query(
      `UPDATE trial_slots
       SET branch_id = $1, title = $2, starts_at = $3::timestamptz, ends_at = $4::timestamptz, capacity = $5,
           is_published = $6, is_cancelled = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        branch_id ? Number(branch_id) : null,
        title ? String(title).trim().slice(0, 255) : null,
        starts_at,
        ends_at,
        Math.max(Number(capacity) || 1, 1),
        is_published !== false,
        is_cancelled === true,
        id,
      ]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Horário não encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/trial-slots/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar horário de aula experimental' })
  }
})

router.delete('/trial-slots/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await pool.query('DELETE FROM trial_slots WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Horário não encontrado' })
    res.status(204).send()
  } catch (error) {
    console.error('[admin-academy/trial-slots/delete]', error)
    res.status(500).json({ error: 'Erro ao remover horário de aula experimental' })
  }
})

router.get('/trial-reservations', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT tr.*, ts.starts_at, ts.ends_at, ts.title AS slot_title, b.name AS branch_name
       FROM trial_reservations tr
       JOIN trial_slots ts ON ts.id = tr.trial_slot_id
       LEFT JOIN branches b ON b.id = ts.branch_id
       ORDER BY tr.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/trial-reservations/list]', error)
    res.status(500).json({ error: 'Erro ao listar reservas de aula experimental' })
  }
})

router.patch('/trial-reservations/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status, notes } = req.body || {}
    const result = await pool.query(
      `UPDATE trial_reservations
       SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status || null, notes || null, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/trial-reservations/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar reserva' })
  }
})

router.get('/leads', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/leads/list]', error)
    res.status(500).json({ error: 'Erro ao listar leads' })
  }
})

router.patch('/leads/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status, notes } = req.body || {}
    const result = await pool.query(
      `UPDATE leads
       SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status || null, notes || null, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lead não encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/leads/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar lead' })
  }
})

// ----- Invoices -----
router.get('/invoices', async (req, res) => {
  try {
    const studentId = req.query.student_id ? Number(req.query.student_id) : null
    const params = []
    let where = ''
    if (studentId) {
      params.push(studentId)
      where = 'WHERE i.student_id = $1'
    }
    const result = await pool.query(
      `SELECT i.*, s.name AS student_name, s.email AS student_email, p.name AS plan_name
       FROM invoices i
       JOIN students s ON s.id = i.student_id
       LEFT JOIN student_plan_assignments spa ON spa.id = i.plan_assignment_id
       LEFT JOIN plans p ON p.id = spa.plan_id
       ${where}
       ORDER BY i.reference_month DESC, i.created_at DESC`,
      params
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/invoices/list]', error)
    res.status(500).json({ error: 'Erro ao listar faturas' })
  }
})

router.post('/invoices', async (req, res) => {
  try {
    const { student_id, plan_assignment_id, reference_month, due_date, amount_brl, status, notes } = req.body || {}
    if (!student_id || !reference_month) {
      return res.status(400).json({ error: 'student_id e reference_month são obrigatórios' })
    }
    const result = await pool.query(
      `INSERT INTO invoices (student_id, plan_assignment_id, reference_month, due_date, amount_brl, status, notes)
       VALUES ($1, $2, $3::date, $4::date, $5, $6, $7)
       RETURNING *`,
      [
        Number(student_id),
        plan_assignment_id ? Number(plan_assignment_id) : null,
        reference_month,
        due_date || null,
        toDecimalOrNull(amount_brl) ?? 0,
        status || 'open',
        notes ? String(notes).trim().slice(0, 2000) : null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/invoices/create]', error)
    if (String(error?.message || '').toLowerCase().includes('unique')) {
      return res.status(409).json({ error: 'Já existe fatura para este aluno no mês informado' })
    }
    res.status(500).json({ error: 'Erro ao criar fatura' })
  }
})

router.patch('/invoices/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { due_date, amount_brl, status, paid_at, payment_method, notes } = req.body || {}
    const result = await pool.query(
      `UPDATE invoices
       SET due_date = COALESCE($1::date, due_date),
           amount_brl = COALESCE($2, amount_brl),
           status = COALESCE($3, status),
           paid_at = $4::timestamptz,
           payment_method = $5,
           notes = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        due_date || null,
        toDecimalOrNull(amount_brl),
        status || null,
        paid_at || null,
        payment_method ? String(payment_method).trim().slice(0, 60) : null,
        notes ? String(notes).trim().slice(0, 2000) : null,
        id,
      ]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fatura não encontrada' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/invoices/update]', error)
    res.status(500).json({ error: 'Erro ao atualizar fatura' })
  }
})

// ----- Student messages -----
router.get('/student-messages', async (req, res) => {
  try {
    const studentId = req.query.student_id ? Number(req.query.student_id) : null
    const params = []
    let where = ''
    if (studentId) {
      params.push(studentId)
      where = 'WHERE sm.student_id = $1'
    }
    const result = await pool.query(
      `SELECT sm.*, s.name AS student_name, s.email AS student_email
       FROM student_messages sm
       JOIN students s ON s.id = sm.student_id
       ${where}
       ORDER BY sm.created_at DESC`,
      params
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[admin-academy/student-messages/list]', error)
    res.status(500).json({ error: 'Erro ao listar mensagens dos alunos' })
  }
})

router.post('/student-messages', async (req, res) => {
  try {
    const { student_id, subject, body } = req.body || {}
    if (!student_id || !body) {
      return res.status(400).json({ error: 'student_id e body são obrigatórios' })
    }
    const result = await pool.query(
      `INSERT INTO student_messages (student_id, sender_role, subject, body)
       VALUES ($1, 'admin', $2, $3)
       RETURNING *`,
      [Number(student_id), subject ? String(subject).trim().slice(0, 255) : null, String(body).trim().slice(0, 5000)]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/student-messages/create]', error)
    res.status(500).json({ error: 'Erro ao criar mensagem para aluno' })
  }
})

router.patch('/student-messages/:id/read', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await pool.query(
      'UPDATE student_messages SET read_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mensagem não encontrada' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[admin-academy/student-messages/read]', error)
    res.status(500).json({ error: 'Erro ao marcar mensagem como lida' })
  }
})

export default router
