import { useEffect, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

const emptySlotForm = {
  branch_id: '',
  title: '',
  starts_at: '',
  ends_at: '',
  capacity: 1,
  is_published: true,
  is_cancelled: false,
}

function formatDateTimeInput(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function TrialBookingsManage() {
  const [slots, setSlots] = useState([])
  const [reservations, setReservations] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [slotForm, setSlotForm] = useState(emptySlotForm)

  async function load() {
    setLoading(true)
    try {
      const [slotsData, reservationsData, leadsData] = await Promise.all([
        admin.trial.listSlots(),
        admin.trial.listReservations(),
        admin.trial.listLeads(),
      ])
      setSlots(Array.isArray(slotsData) ? slotsData : [])
      setReservations(Array.isArray(reservationsData) ? reservationsData : [])
      setLeads(Array.isArray(leadsData) ? leadsData : [])
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
  }

  function openEditSlot(slot) {
    setEditingSlot(slot)
    setSlotForm({
      branch_id: slot.branch_id || '',
      title: slot.title || '',
      starts_at: formatDateTimeInput(slot.starts_at),
      ends_at: formatDateTimeInput(slot.ends_at),
      capacity: slot.capacity || 1,
      is_published: slot.is_published !== false,
      is_cancelled: slot.is_cancelled === true,
    })
  }

  async function saveSlot() {
    setSaving(true)
    try {
      const payload = {
        branch_id: slotForm.branch_id ? Number(slotForm.branch_id) : null,
        title: slotForm.title || null,
        starts_at: slotForm.starts_at ? new Date(slotForm.starts_at).toISOString() : null,
        ends_at: slotForm.ends_at ? new Date(slotForm.ends_at).toISOString() : null,
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
          <div className="space-y-3">
            <input
              type="number"
              placeholder="ID da unidade (opcional)"
              value={slotForm.branch_id}
              onChange={(event) => setSlotForm((prev) => ({ ...prev, branch_id: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
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
                onChange={(event) => setSlotForm((prev) => ({ ...prev, starts_at: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="datetime-local"
                value={slotForm.ends_at}
                onChange={(event) => setSlotForm((prev) => ({ ...prev, ends_at: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <input
              type="number"
              min={1}
              placeholder="Capacidade"
              value={slotForm.capacity}
              onChange={(event) => setSlotForm((prev) => ({ ...prev, capacity: event.target.value }))}
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
                <button type="button" onClick={openNewSlot} className="px-4 py-2 border border-slate-300 rounded-lg">
                  Novo
                </button>
              )}
            </div>
          </div>
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
                        {slot.branch_name || 'Unidade não definida'} · Capacidade: {slot.capacity} ·{' '}
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
