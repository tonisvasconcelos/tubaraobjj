import { useEffect, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

const emptySlotForm = {
  branch_id: '',
  team_member_id: '',
  class_type: 'experimental_group',
  title: '',
  starts_at: '',
  ends_at: '',
  capacity: 1,
  is_published: true,
  is_cancelled: false,
}

const emptyRecurringForm = {
  branch_id: '',
  team_member_id: '',
  class_type: 'experimental_group',
  title: '',
  range_start: '',
  range_end: '',
  weekdays: [],
  start_time: '10:00',
  end_time: '11:00',
  capacity: 1,
  is_published: true,
  is_cancelled: false,
}

/** 0 = domingo … 6 = sábado (API / backend) */
const WEEKDAY_OPTIONS = [
  { v: 0, label: 'Dom' },
  { v: 1, label: 'Seg' },
  { v: 2, label: 'Ter' },
  { v: 3, label: 'Qua' },
  { v: 4, label: 'Qui' },
  { v: 5, label: 'Sex' },
  { v: 6, label: 'Sáb' },
]

const CLASS_TYPE_OPTIONS = [
  { value: 'experimental_group', label: 'Experimental Class Group' },
  { value: 'private_class', label: 'Private Class' },
]
const MAX_FALLBACK_OCCURRENCES = 180

function formatDateTimeInput(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function formatDatePart(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildRecurringFallbackPayloads(form) {
  const startDate = new Date(`${form.range_start}T00:00:00`)
  const endDate = new Date(`${form.range_end}T00:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Período inválido para criar a série.')
  }
  if (endDate < startDate) {
    throw new Error('A data final deve ser maior ou igual à data inicial.')
  }

  const selectedWeekdays = new Set(form.weekdays)
  const payloads = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    if (selectedWeekdays.has(cursor.getDay())) {
      const datePart = formatDatePart(cursor)
      const startsAt = new Date(`${datePart}T${form.start_time}:00`)
      const endsAt = new Date(`${datePart}T${form.end_time}:00`)
      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        throw new Error('Hora de início/fim inválida.')
      }
      if (endsAt <= startsAt) {
        throw new Error('A hora final deve ser maior que a hora inicial.')
      }
      payloads.push({
        branch_id: Number(form.branch_id),
        team_member_id: form.team_member_id === '' ? null : Number(form.team_member_id),
        class_type: form.class_type || 'experimental_group',
        title: form.title || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        capacity: Math.max(Number(form.capacity) || 1, 1),
        is_published: form.is_published !== false,
        is_cancelled: form.is_cancelled === true,
      })
      if (payloads.length > MAX_FALLBACK_OCCURRENCES) {
        throw new Error(
          `A série excede ${MAX_FALLBACK_OCCURRENCES} ocorrências. Reduza o período ou dias selecionados.`
        )
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  if (!payloads.length) {
    throw new Error('Nenhuma ocorrência encontrada para os dias selecionados no período informado.')
  }
  return payloads
}

export default function TrialBookingsManage() {
  const [slots, setSlots] = useState([])
  const [reservations, setReservations] = useState([])
  const [leads, setLeads] = useState([])
  const [branches, setBranches] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [slotForm, setSlotForm] = useState(emptySlotForm)
  const [createMode, setCreateMode] = useState('single')
  const [recurringForm, setRecurringForm] = useState(emptyRecurringForm)

  async function load() {
    setLoading(true)
    try {
      const [slotsData, reservationsData, leadsData, branchesData, teamData] = await Promise.all([
        admin.trial.listSlots(),
        admin.trial.listReservations(),
        admin.trial.listLeads(),
        admin.branches.list(),
        admin.team.list(),
      ])
      setSlots(Array.isArray(slotsData) ? slotsData : [])
      setReservations(Array.isArray(reservationsData) ? reservationsData : [])
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setBranches(Array.isArray(branchesData) ? branchesData : [])
      setTeamMembers(Array.isArray(teamData) ? teamData : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar dados de aula experimental')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openNewSlot() {
    setEditingSlot(null)
    setSlotForm(emptySlotForm)
    setRecurringForm(emptyRecurringForm)
    setCreateMode('single')
  }

  function openEditSlot(slot) {
    setEditingSlot(slot)
    setCreateMode('single')
    setSlotForm({
      branch_id: slot.branch_id || '',
      team_member_id: slot.team_member_id != null ? String(slot.team_member_id) : '',
      class_type: slot.class_type || 'experimental_group',
      title: slot.title || '',
      starts_at: formatDateTimeInput(slot.starts_at),
      ends_at: formatDateTimeInput(slot.ends_at),
      capacity: slot.capacity || 1,
      is_published: slot.is_published !== false,
      is_cancelled: slot.is_cancelled === true,
    })
  }

  function toggleRecurringWeekday(day) {
    setRecurringForm((prev) => {
      const set = new Set(prev.weekdays)
      if (set.has(day)) set.delete(day)
      else set.add(day)
      return { ...prev, weekdays: [...set].sort((a, b) => a - b) }
    })
  }

  async function saveSlot() {
    if (!slotForm.starts_at || !slotForm.ends_at) {
      alert('Informe início e fim do horário.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        branch_id: slotForm.branch_id ? Number(slotForm.branch_id) : null,
        team_member_id: slotForm.team_member_id === '' ? null : Number(slotForm.team_member_id),
        class_type: slotForm.class_type || 'experimental_group',
        title: slotForm.title || null,
        starts_at: new Date(slotForm.starts_at).toISOString(),
        ends_at: new Date(slotForm.ends_at).toISOString(),
        capacity: Math.max(Number(slotForm.capacity) || 1, 1),
        is_published: slotForm.is_published,
        is_cancelled: slotForm.is_cancelled,
      }
      if (editingSlot) {
        await admin.trial.updateSlot(editingSlot.id, payload)
      } else {
        await admin.trial.createSlot(payload)
      }
      openNewSlot()
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao salvar horário')
    } finally {
      setSaving(false)
    }
  }

  async function saveRecurringSeries() {
    if (!recurringForm.branch_id) {
      alert('Selecione a unidade para a série.')
      return
    }
    if (!recurringForm.range_start || !recurringForm.range_end) {
      alert('Informe data inicial e final do período.')
      return
    }
    if (!recurringForm.weekdays.length) {
      alert('Selecione pelo menos um dia da semana.')
      return
    }
    if (!recurringForm.start_time || !recurringForm.end_time) {
      alert('Informe hora inicial e final da série.')
      return
    }
    setSaving(true)
    try {
      const payloads = buildRecurringFallbackPayloads(recurringForm)
      let created = 0
      for (const payload of payloads) {
        await admin.trial.createSlot(payload)
        created += 1
      }
      alert(`Série criada: ${created} horário(s).`)
      setRecurringForm(emptyRecurringForm)
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao criar série')
    } finally {
      setSaving(false)
    }
  }

  async function removeSlot(id) {
    if (!confirm('Remover este horário de aula experimental?')) return
    try {
      await admin.trial.deleteSlot(id)
      if (editingSlot?.id === id) openNewSlot()
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao remover horário')
    }
  }

  async function updateReservationStatus(reservation, status) {
    try {
      await admin.trial.updateReservation(reservation.id, { status })
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao atualizar reserva')
    }
  }

  async function updateLeadStatus(lead, status) {
    try {
      await admin.trial.updateLead(lead.id, { status })
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao atualizar lead')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Aula Experimental</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">
            {editingSlot ? 'Editar horário disponível' : 'Novo horário disponível'}
          </h2>

          {!editingSlot && (
            <div className="flex rounded-lg border border-slate-200 p-1 mb-4 gap-1">
              <button
                type="button"
                onClick={() => setCreateMode('single')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  createMode === 'single' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Horário único
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('recurring')}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  createMode === 'recurring'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Recorrente
              </button>
            </div>
          )}

          {createMode === 'recurring' && !editingSlot ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Horários em America/São Paulo (UTC−3). Dias: 0 = domingo … 6 = sábado.
              </p>
              <select
                value={recurringForm.branch_id}
                onChange={(event) =>
                  setRecurringForm((prev) => ({ ...prev, branch_id: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                required
              >
                <option value="">Unidade *</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                value={recurringForm.team_member_id}
                onChange={(event) =>
                  setRecurringForm((prev) => ({ ...prev, team_member_id: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Professor responsável (opcional)</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.role}
                  </option>
                ))}
              </select>
              <select
                value={recurringForm.class_type}
                onChange={(event) =>
                  setRecurringForm((prev) => ({ ...prev, class_type: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {CLASS_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Type of Experimental Class: {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título (ex: Turma Experimental Adulto)"
                value={recurringForm.title}
                onChange={(event) =>
                  setRecurringForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Data inicial</label>
                  <input
                    type="date"
                    value={recurringForm.range_start}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, range_start: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Data final</label>
                  <input
                    type="date"
                    value={recurringForm.range_end}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, range_end: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-2">Dias da semana</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((wd) => (
                    <label
                      key={wd.v}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm cursor-pointer ${
                        recurringForm.weekdays.includes(wd.v)
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={recurringForm.weekdays.includes(wd.v)}
                        onChange={() => toggleRecurringWeekday(wd.v)}
                      />
                      {wd.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Início (hora)</label>
                  <input
                    type="time"
                    value={recurringForm.start_time}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, start_time: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Fim (hora)</label>
                  <input
                    type="time"
                    value={recurringForm.end_time}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, end_time: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <input
                type="number"
                min={1}
                placeholder="Capacidade"
                value={recurringForm.capacity}
                onChange={(event) =>
                  setRecurringForm((prev) => ({ ...prev, capacity: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recurringForm.is_published}
                  onChange={(event) =>
                    setRecurringForm((prev) => ({ ...prev, is_published: event.target.checked }))
                  }
                />
                Publicado no site
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recurringForm.is_cancelled}
                  onChange={(event) =>
                    setRecurringForm((prev) => ({ ...prev, is_cancelled: event.target.checked }))
                  }
                />
                Cancelado
              </label>
              <button
                type="button"
                onClick={saveRecurringSeries}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar série
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={slotForm.branch_id}
                onChange={(event) => setSlotForm((prev) => ({ ...prev, branch_id: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Unidade (opcional)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                value={slotForm.team_member_id}
                onChange={(event) =>
                  setSlotForm((prev) => ({ ...prev, team_member_id: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Professor responsável (opcional)</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.role}
                  </option>
                ))}
              </select>
              <select
                value={slotForm.class_type}
                onChange={(event) =>
                  setSlotForm((prev) => ({ ...prev, class_type: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {CLASS_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Type of Experimental Class: {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título (ex: Turma Experimental Adulto)"
                value={slotForm.title}
                onChange={(event) => setSlotForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={slotForm.starts_at}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, starts_at: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
                <input
                  type="datetime-local"
                  value={slotForm.ends_at}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, ends_at: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <input
                type="number"
                min={1}
                placeholder="Capacidade"
                value={slotForm.capacity}
                onChange={(event) =>
                  setSlotForm((prev) => ({ ...prev, capacity: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slotForm.is_published}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, is_published: event.target.checked }))
                  }
                />
                Publicado no site
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slotForm.is_cancelled}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, is_cancelled: event.target.checked }))
                  }
                />
                Cancelado
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveSlot}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSlot ? 'Atualizar' : 'Criar'}
                </button>
                {editingSlot && (
                  <button
                    type="button"
                    onClick={openNewSlot}
                    className="px-4 py-2 border border-slate-300 rounded-lg"
                  >
                    Novo
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Horários cadastrados</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-2 max-h-[28rem] overflow-auto">
              {slots.map((slot) => (
                <li key={slot.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{slot.title || 'Aula experimental'}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(slot.starts_at).toLocaleString('pt-BR')} -{' '}
                        {new Date(slot.ends_at).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {slot.branch_name || 'Unidade não definida'}
                        {` · ${
                          slot.class_type === 'private_class'
                            ? 'Private Class'
                            : 'Experimental Class Group'
                        }`}
                        {slot.instructor_name ? ` · Prof. ${slot.instructor_name}` : ''} · Capacidade:{' '}
                        {slot.capacity} ·{' '}
                        {slot.is_cancelled ? 'Cancelado' : slot.is_published ? 'Publicado' : 'Rascunho'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEditSlot(slot)}
                        className="p-2 text-slate-600 hover:text-slate-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Reservas de aula experimental</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : reservations.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma reserva registrada.</p>
          ) : (
            <ul className="space-y-2 max-h-[24rem] overflow-auto">
              {reservations.map((reservation) => (
                <li key={reservation.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">
                    {reservation.name} · {reservation.phone}
                  </p>
                  <p className="text-sm text-slate-600">{reservation.email}</p>
                  <p className="text-sm text-slate-600">
                    {reservation.branch_name || 'Unidade'} ·{' '}
                    {reservation.starts_at
                      ? new Date(reservation.starts_at).toLocaleString('pt-BR')
                      : 'Sem horário'}
                  </p>
                  <p className="text-xs text-slate-500">Status atual: {reservation.status}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateReservationStatus(reservation, 'confirmed')}
                      className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReservationStatus(reservation, 'completed')}
                      className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Concluída
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReservationStatus(reservation, 'cancelled')}
                      className="text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Leads e mensagens da aula experimental</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : leads.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum lead registrado.</p>
          ) : (
            <ul className="space-y-2 max-h-[24rem] overflow-auto">
              {leads.map((lead) => (
                <li key={lead.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">
                    {lead.name} · {lead.phone}
                  </p>
                  <p className="text-sm text-slate-600">{lead.email}</p>
                  <p className="text-xs text-slate-500">
                    Fonte: {lead.source || 'website'} · Status: {lead.status}
                  </p>
                  {(lead.requested_class_type ||
                    lead.has_gi != null ||
                    lead.has_previous_experience != null ||
                    lead.gender) ? (
                    <div className="mt-1 text-xs text-slate-600 space-y-1">
                      {lead.requested_class_type ? (
                        <p>
                          Tipo:{' '}
                          {lead.requested_class_type === 'private_class'
                            ? 'Private Class'
                            : 'Experimental Class Group'}
                        </p>
                      ) : null}
                      {lead.has_gi != null ? (
                        <p>
                          Possui kimono? {lead.has_gi ? 'Sim' : 'Não'}
                          {!lead.has_gi && lead.gi_size ? ` · Tamanho: ${lead.gi_size}` : ''}
                        </p>
                      ) : null}
                      {lead.has_previous_experience != null ? (
                        <p>
                          Já praticou? {lead.has_previous_experience ? 'Sim' : 'Não'}
                          {lead.has_previous_experience && lead.experience_duration
                            ? ` · Tempo: ${lead.experience_duration}`
                            : ''}
                          {lead.has_previous_experience && lead.current_belt
                            ? ` · Faixa: ${lead.current_belt}`
                            : ''}
                          {lead.has_previous_experience && lead.stripe_count != null
                            ? ` · Listras: ${lead.stripe_count}`
                            : ''}
                        </p>
                      ) : null}
                      {lead.previous_team ? <p>Equipe anterior: {lead.previous_team}</p> : null}
                      {lead.gender ? (
                        <p>
                          Sexo:{' '}
                          {lead.gender === 'female'
                            ? 'Feminino'
                            : lead.gender === 'male'
                              ? 'Masculino'
                              : 'Prefiro não informar'}
                          {lead.gender === 'female' && lead.prefer_female_instructor != null
                            ? ` · Prefere professora: ${lead.prefer_female_instructor ? 'Sim' : 'Não'}`
                            : ''}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {lead.notes && <p className="text-sm text-slate-700 mt-1">{lead.notes}</p>}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateLeadStatus(lead, 'contacted')}
                      className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Contatado
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLeadStatus(lead, 'converted')}
                      className="text-xs px-3 py-1 border border-green-300 text-green-700 rounded hover:bg-green-50"
                    >
                      Convertido
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLeadStatus(lead, 'lost')}
                      className="text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Perdido
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
