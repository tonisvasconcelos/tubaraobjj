import { useState, useEffect } from 'react'
import { admin } from '../../services/adminApi'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

const DAY_OPTIONS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
]

function formatTimeForInput(t) {
  if (t == null || t === '') return ''
  const s = String(t)
  return s.length >= 5 ? s.slice(0, 5) : s
}

const emptyForm = () => ({
  branch_name: '',
  training_type: '',
  team_member_id: '',
  day_of_week: 1,
  start_time: '18:00',
  end_time: '19:30',
  notes: '',
  sort_order: 0,
  is_published: true,
})

export default function SchedulesManage() {
  const [list, setList] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [data, teamData] = await Promise.all([admin.schedules.list(), admin.team.list()])
      setList(Array.isArray(data) ? data : [])
      setTeamMembers(Array.isArray(teamData) ? teamData : [])
    } catch (e) {
      console.error(e)
      setList([])
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ ...emptyForm(), sort_order: list.length })
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      branch_name: row.branch_name || '',
      training_type: row.training_type || '',
      team_member_id: row.team_member_id != null ? String(row.team_member_id) : '',
      day_of_week: Number(row.day_of_week) || 0,
      start_time: formatTimeForInput(row.start_time),
      end_time: formatTimeForInput(row.end_time),
      notes: row.notes || '',
      sort_order: row.sort_order ?? 0,
      is_published: row.is_published !== false,
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        branch_name: form.branch_name,
        training_type: form.training_type,
        team_member_id: form.team_member_id === '' ? null : Number(form.team_member_id),
        day_of_week: Number(form.day_of_week),
        start_time: form.start_time || '00:00',
        end_time: form.end_time || '00:00',
        notes: form.notes || null,
        sort_order: Number(form.sort_order) || 0,
        is_published: form.is_published,
      }
      if (editing) {
        await admin.schedules.update(editing.id, payload)
      } else {
        await admin.schedules.create(payload)
      }
      setEditing(null)
      setForm(emptyForm())
      load()
    } catch (e) {
      alert(e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Remover este horário?')) return
    try {
      await admin.schedules.delete(id)
      load()
      if (editing?.id === id) {
        setEditing(null)
        setForm(emptyForm())
      }
    } catch (e) {
      alert(e.message || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Horários</h1>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px] max-w-md">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? 'Editar' : 'Novo horário'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Unidade (ex: Vila Isabel)"
              value={form.branch_name}
              onChange={(e) => setForm((f) => ({ ...f, branch_name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Tipo de treino (ex: Gi, No-Gi, Feminino)"
              value={form.training_type}
              onChange={(e) => setForm((f) => ({ ...f, training_type: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div>
              <label className="block text-sm text-slate-600 mb-1">Professor responsável</label>
              <select
                value={form.team_member_id}
                onChange={(e) => setForm((f) => ({ ...f, team_member_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Sem professor definido</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.role ? ` — ${member.role}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Dia da semana</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Início</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Fim</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <textarea
              placeholder="Observações (opcional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              rows={2}
            />
            <div>
              <label className="block text-sm text-slate-600 mb-1">Ordem</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              />
              Publicado (visível no site)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Atualizar' : 'Criar'}
              </button>
              {editing && (
                <button type="button" onClick={openNew} className="px-4 py-2 border border-slate-300 rounded-lg">
                  Novo
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[300px]">
          <h2 className="font-semibold text-slate-800 mb-4">Todos os horários</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-3">
              {list.map((row) => {
                const dayLabel = DAY_OPTIONS.find((d) => d.value === Number(row.day_of_week))?.label || ''
                return (
                  <li key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">
                        {row.branch_name || '—'} · {dayLabel}{' '}
                        <span className="text-slate-600 font-normal tabular-nums">
                          {formatTimeForInput(row.start_time)}–{formatTimeForInput(row.end_time)}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">{row.training_type}</p>
                      {row.team_member_name ? (
                        <p className="text-xs text-slate-500">
                          Prof. {row.team_member_name}
                          {row.team_member_role ? ` — ${row.team_member_role}` : ''}
                        </p>
                      ) : null}
                      {!row.is_published && (
                        <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          Rascunho
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="p-2 text-slate-600 hover:text-slate-900"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {!loading && list.length === 0 && (
            <p className="text-slate-500 text-sm">Nenhum horário cadastrado. Use o formulário ao lado.</p>
          )}
        </div>
      </div>
    </div>
  )
}
