import express from 'express'
import pool from '../db/pool.js'
import { authMiddleware, requireStudent } from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware, requireStudent)

function getStudentId(req) {
  return Number(req.user?.studentId)
}

router.get('/me', async (req, res) => {
  try {
    const studentId = getStudentId(req)
    const result = await pool.query(
      `SELECT id, name, email, phone, student_level, status, created_at, updated_at
       FROM students
       WHERE id = $1`,
      [studentId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('[student/me]', error)
    res.status(500).json({ error: 'Erro ao carregar dados do aluno' })
  }
})

router.get('/plan-status', async (req, res) => {
  try {
    const studentId = getStudentId(req)
    const result = await pool.query(
      `SELECT spa.*, p.name AS plan_name, p.description AS plan_description, p.monthly_fee_brl AS plan_monthly_fee_brl,
              p.allowed_training_days, p.allowed_training_times, p.supported_student_levels, p.allowed_branch_ids
       FROM student_plan_assignments spa
       JOIN plans p ON p.id = spa.plan_id
       WHERE spa.student_id = $1
       ORDER BY (spa.status = 'active') DESC, spa.created_at DESC
       LIMIT 1`,
      [studentId]
    )
    res.json(result.rows[0] || null)
  } catch (error) {
    console.error('[student/plan-status]', error)
    res.status(500).json({ error: 'Erro ao carregar status do plano' })
  }
})

router.get('/invoices', async (req, res) => {
  try {
    const studentId = getStudentId(req)
    const result = await pool.query(
      `SELECT id, student_id, reference_month, due_date, amount_brl, status, paid_at, payment_method, notes, created_at, updated_at
       FROM invoices
       WHERE student_id = $1
       ORDER BY reference_month DESC, created_at DESC`,
      [studentId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[student/invoices]', error)
    res.status(500).json({ error: 'Erro ao carregar faturas' })
  }
})

router.get('/messages', async (req, res) => {
  try {
    const studentId = getStudentId(req)
    const result = await pool.query(
      `SELECT id, student_id, sender_role, subject, body, read_at, created_at
       FROM student_messages
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[student/messages/list]', error)
    res.status(500).json({ error: 'Erro ao carregar mensagens' })
  }
})

router.post('/messages', async (req, res) => {
  try {
    const studentId = getStudentId(req)
    const { subject, body } = req.body || {}
    if (!body) return res.status(400).json({ error: 'Mensagem é obrigatória' })
    const result = await pool.query(
      `INSERT INTO student_messages (student_id, sender_role, subject, body)
       VALUES ($1, 'student', $2, $3)
       RETURNING id, student_id, sender_role, subject, body, read_at, created_at`,
      [studentId, subject ? String(subject).trim().slice(0, 255) : null, String(body).trim().slice(0, 5000)]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('[student/messages/create]', error)
    res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }
})

router.get('/trial-bookings', async (req, res) => {
  try {
    const studentId = getStudentId(req)
    const result = await pool.query(
      `SELECT tr.id, tr.status, tr.created_at, ts.starts_at, ts.ends_at, ts.title, b.name AS branch_name
       FROM trial_reservations tr
       JOIN trial_slots ts ON ts.id = tr.trial_slot_id
       LEFT JOIN branches b ON b.id = ts.branch_id
       WHERE tr.student_id = $1
       ORDER BY ts.starts_at DESC`,
      [studentId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('[student/trial-bookings]', error)
    res.status(500).json({ error: 'Erro ao carregar aulas experimentais' })
  }
})

export default router
