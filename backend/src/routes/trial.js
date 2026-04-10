import express from 'express'
import pool from '../db/pool.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = express.Router()
const TRIAL_CLASS_TYPES = new Set(['experimental_group', 'private_class'])
const GI_SIZES = new Set(['A1', 'A2', 'A3', 'A4'])
const GENDERS = new Set(['female', 'male', 'prefer_not_to_inform'])

function isWeekdayDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false
  const [year, month, day] = dateText.split('-').map((n) => Number(n))
  const dt = new Date(Date.UTC(year, month - 1, day))
  const weekday = dt.getUTCDay()
  return weekday >= 1 && weekday <= 5
}

function parseClockTimeMinutes(timeText) {
  if (!/^\d{2}:\d{2}$/.test(timeText)) return null
  const [h, m] = timeText.split(':').map((n) => Number(n))
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

function parseBooleanLike(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'sim'].includes(normalized)) return true
    if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) return false
  }
  return null
}

function normalizeGender(value) {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return null
  if (raw === 'female' || raw === 'feminino') return 'female'
  if (raw === 'male' || raw === 'masculino') return 'male'
  if (
    raw === 'prefer_not_to_inform' ||
    raw === 'prefiro nao informar' ||
    raw === 'prefiro não informar'
  ) {
    return 'prefer_not_to_inform'
  }
  return null
}

function parseTrialIntakeFields(body) {
  const hasGi = parseBooleanLike(body.hasGi)
  if (hasGi === null) throw new Error('hasGi inválido')

  let giSize = null
  if (hasGi === false) {
    const size = String(body.giSize || '').trim().toUpperCase()
    if (!GI_SIZES.has(size)) throw new Error('giSize inválido')
    giSize = size
  }

  const hasPreviousExperience = parseBooleanLike(body.hasPreviousExperience)
  if (hasPreviousExperience === null) throw new Error('hasPreviousExperience inválido')

  let experienceDuration = null
  let currentBelt = null
  let stripeCount = null
  if (hasPreviousExperience) {
    experienceDuration = String(body.experienceDuration || '').trim()
    currentBelt = String(body.currentBelt || '').trim()
    const stripesRaw = Number(body.stripeCount)
    if (!experienceDuration) throw new Error('experienceDuration é obrigatório')
    if (!currentBelt) throw new Error('currentBelt é obrigatório')
    if (!Number.isInteger(stripesRaw) || stripesRaw < 0 || stripesRaw > 20) {
      throw new Error('stripeCount inválido')
    }
    experienceDuration = experienceDuration.slice(0, 120)
    currentBelt = currentBelt.slice(0, 80)
    stripeCount = stripesRaw
  }

  const previousTeam = body.previousTeam ? String(body.previousTeam).trim().slice(0, 255) : null

  const gender = normalizeGender(body.gender)
  if (!gender || !GENDERS.has(gender)) throw new Error('gender inválido')

  let preferFemaleInstructor = null
  if (gender === 'female') {
    const pref = parseBooleanLike(body.preferFemaleInstructor)
    if (pref === null) throw new Error('preferFemaleInstructor inválido')
    preferFemaleInstructor = pref
  }

  return {
    hasGi,
    giSize,
    hasPreviousExperience,
    experienceDuration,
    currentBelt,
    stripeCount,
    previousTeam,
    gender,
    preferFemaleInstructor,
  }
}

router.get('/slots', async (req, res) => {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date()
    const to = req.query.to ? new Date(String(req.query.to)) : null
    const branchId = req.query.branch_id ? Number(req.query.branch_id) : null
    const classType = req.query.class_type ? String(req.query.class_type).trim() : ''

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
    if (classType) {
      if (!TRIAL_CLASS_TYPES.has(classType)) {
        return res.status(400).json({ error: 'class_type inválido' })
      }
      params.push(classType)
      filters.push(`ts.class_type = $${params.length}`)
    }

    const result = await pool.query(
      `SELECT ts.id, ts.branch_id, b.name AS branch_name, ts.class_type, ts.title, ts.starts_at, ts.ends_at, ts.capacity,
              ts.team_member_id,
              tm.name AS instructor_name, tm.role AS instructor_role,
              COALESCE((
                SELECT COUNT(*)
                FROM trial_reservations tr
                WHERE tr.trial_slot_id = ts.id
                  AND tr.status IN ('confirmed', 'pending')
              ), 0)::int AS booked_count
       FROM trial_slots ts
       LEFT JOIN branches b ON b.id = ts.branch_id
       LEFT JOIN team_members tm ON tm.id = ts.team_member_id
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

router.post('/private-request', rateLimit({ windowMs: 60_000, max: 8 }), async (req, res) => {
  try {
    const { branchId, name, email, phone, requestedDate, requestedTime, interestProgram, notes } =
      req.body || {}

    if (!branchId || !name || !email || !phone || !requestedDate || !requestedTime) {
      return res.status(400).json({
        error:
          'branchId, name, email, phone, requestedDate e requestedTime são obrigatórios',
      })
    }

    const branchIdNum = Number(branchId)
    if (Number.isNaN(branchIdNum) || branchIdNum < 1) {
      return res.status(400).json({ error: 'branchId inválido' })
    }
    const branch = await pool.query('SELECT id, name FROM branches WHERE id = $1', [branchIdNum])
    if (branch.rows.length === 0) {
      return res.status(400).json({ error: 'Unidade não encontrada' })
    }

    const dateText = String(requestedDate).trim()
    const timeText = String(requestedTime).trim()
    let intake = null
    try {
      intake = parseTrialIntakeFields(req.body || {})
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Dados adicionais inválidos' })
    }
    if (!isWeekdayDate(dateText)) {
      return res
        .status(400)
        .json({ error: 'requestedDate deve ser em dia útil (segunda a sexta)' })
    }
    const minutes = parseClockTimeMinutes(timeText)
    if (minutes == null || minutes < 8 * 60 || minutes > 17 * 60) {
      return res
        .status(400)
        .json({ error: 'requestedTime deve estar entre 08:00 e 17:00' })
    }

    const normalizedNotes = notes ? String(notes).trim().slice(0, 3800) : ''
    const extraNotes = `Unidade solicitada (#${branchIdNum}): ${branch.rows[0].name}`
    const finalNotes = normalizedNotes
      ? `${normalizedNotes}\n\n${extraNotes}`
      : extraNotes

    const lead = await pool.query(
      `INSERT INTO leads (
          name, email, phone, interest_program, preferred_time, notes,
          source, status, requested_class_type, requested_date, requested_time,
          has_gi, gi_size, has_previous_experience, experience_duration, current_belt,
          stripe_count, previous_team, gender, prefer_female_instructor
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11::time, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING id`,
      [
        String(name).trim().slice(0, 255),
        String(email).trim().toLowerCase().slice(0, 255),
        String(phone).trim().slice(0, 100),
        interestProgram ? String(interestProgram).trim().slice(0, 120) : null,
        `${dateText} ${timeText}`,
        finalNotes,
        'website_trial_private',
        'new',
        'private_class',
        dateText,
        timeText,
        intake.hasGi,
        intake.giSize,
        intake.hasPreviousExperience,
        intake.experienceDuration,
        intake.currentBelt,
        intake.stripeCount,
        intake.previousTeam,
        intake.gender,
        intake.preferFemaleInstructor,
      ]
    )

    res.status(201).json({
      message: 'Solicitação de aula experimental privada registrada com sucesso.',
      leadId: lead.rows[0].id,
    })
  } catch (error) {
    console.error('[trial/private-request]', error)
    res.status(500).json({ error: 'Erro ao registrar solicitação privada' })
  }
})

router.post('/reservations', rateLimit({ windowMs: 60_000, max: 8 }), async (req, res) => {
  const client = await pool.connect()
  try {
    const { trialSlotId, name, email, phone, notes, interestProgram, branchId } = req.body || {}
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
    if (branchId != null && branchId !== '') {
      const bid = Number(branchId)
      if (!Number.isNaN(bid)) {
        const slotBranch = slot.branch_id != null ? Number(slot.branch_id) : null
        if (slotBranch === null || slotBranch !== bid) {
          await client.query('ROLLBACK')
          return res.status(400).json({ error: 'A unidade selecionada não corresponde ao horário escolhido.' })
        }
      }
    }
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
    let intake = null
    try {
      intake = parseTrialIntakeFields(req.body || {})
    } catch (error) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: error.message || 'Dados adicionais inválidos' })
    }

    const lead = await client.query(
      `INSERT INTO leads (
          name, email, phone, interest_program, notes, source, status, preferred_time, requested_class_type,
          has_gi, gi_size, has_previous_experience, experience_duration, current_belt,
          stripe_count, previous_team, gender, prefer_female_instructor
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
        'experimental_group',
        intake.hasGi,
        intake.giSize,
        intake.hasPreviousExperience,
        intake.experienceDuration,
        intake.currentBelt,
        intake.stripeCount,
        intake.previousTeam,
        intake.gender,
        intake.preferFemaleInstructor,
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
