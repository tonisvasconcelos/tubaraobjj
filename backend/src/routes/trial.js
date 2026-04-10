import express from 'express'
import pool from '../db/pool.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = express.Router()

router.get('/slots', async (req, res) => {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date()
    const to = req.query.to ? new Date(String(req.query.to)) : null
    const branchId = req.query.branch_id ? Number(req.query.branch_id) : null

    const params = [from.toISOString()]
    const filters = ['ts.is_published = true', 'ts.is_cancelled = false', 'ts.ends_at >= $1::timestamptz']
    if (to && !Number.isNaN(to.getTime())) {
      params.push(to.toISOString())
      filters.push(`ts.starts_at <= $${params.length}::timestamptz`)
    }
    if (branchId) {
      params.push(branchId)
      filters.push(`ts.branch_id = $${params.length}`)
    }

    const result = await pool.query(
      `SELECT ts.id, ts.branch_id, b.name AS branch_name, ts.title, ts.starts_at, ts.ends_at, ts.capacity,
              COALESCE((
                SELECT COUNT(*)
                FROM trial_reservations tr
                WHERE tr.trial_slot_id = ts.id
                  AND tr.status IN ('confirmed', 'pending')
              ), 0)::int AS booked_count
       FROM trial_slots ts
       LEFT JOIN branches b ON b.id = ts.branch_id
       WHERE ${filters.join(' AND ')}
       ORDER BY ts.starts_at ASC`,
      params
    )

    res.json(
      result.rows.map((row) => ({
        ...row,
        available_spots: Math.max(Number(row.capacity || 0) - Number(row.booked_count || 0), 0),
      }))
    )
  } catch (error) {
    console.error('[trial/slots]', error)
    res.status(500).json({ error: 'Erro ao listar horários disponíveis' })
  }
})

router.post('/reservations', rateLimit({ windowMs: 60_000, max: 8 }), async (req, res) => {
  const client = await pool.connect()
  try {
    const { trialSlotId, name, email, phone, notes, interestProgram } = req.body || {}
    if (!trialSlotId || !name || !email || !phone) {
      return res
        .status(400)
        .json({ error: 'trialSlotId, nome, email e telefone são obrigatórios' })
    }

    await client.query('BEGIN')

    const slotResult = await client.query(
      `SELECT id, branch_id, starts_at, ends_at, capacity, is_published, is_cancelled
       FROM trial_slots
       WHERE id = $1
       FOR UPDATE`,
      [Number(trialSlotId)]
    )
    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Horário não encontrado' })
    }
    const slot = slotResult.rows[0]
    if (!slot.is_published || slot.is_cancelled) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Horário indisponível para agendamento' })
    }

    const bookingCount = await client.query(
      `SELECT COUNT(*)::int AS total
       FROM trial_reservations
       WHERE trial_slot_id = $1
         AND status IN ('confirmed', 'pending')`,
      [slot.id]
    )
    if (bookingCount.rows[0].total >= slot.capacity) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'Horário sem vagas disponíveis' })
    }

    const lead = await client.query(
      `INSERT INTO leads (name, email, phone, interest_program, notes, source, status, preferred_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        String(name).trim().slice(0, 255),
        String(email).trim().toLowerCase().slice(0, 255),
        String(phone).trim().slice(0, 100),
        interestProgram ? String(interestProgram).trim().slice(0, 120) : null,
        notes ? String(notes).trim().slice(0, 4000) : null,
        'website_trial_calendar',
        'booked',
        new Date(slot.starts_at).toISOString(),
      ]
    )

    const reservation = await client.query(
      `INSERT INTO trial_reservations (trial_slot_id, lead_id, name, email, phone, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
       RETURNING id, trial_slot_id, status, created_at`,
      [
        slot.id,
        lead.rows[0].id,
        String(name).trim().slice(0, 255),
        String(email).trim().toLowerCase().slice(0, 255),
        String(phone).trim().slice(0, 100),
        notes ? String(notes).trim().slice(0, 4000) : null,
      ]
    )

    await client.query('COMMIT')
    res.status(201).json({
      message: 'Aula experimental agendada com sucesso.',
      reservation: reservation.rows[0],
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[trial/reservations]', error)
    res.status(500).json({ error: 'Erro ao concluir agendamento' })
  } finally {
    client.release()
  }
})

export default router
