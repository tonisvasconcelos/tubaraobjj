import { useEffect, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  monthly_fee_brl: '',
  billing_cycle: 'monthly',
  trial_days: 0,
  sort_order: 0,
  is_active: true,
  allowed_training_days: '',
  allowed_training_times: '',
  supported_student_levels: '',
  allowed_branch_ids: '',
}

export default function PlansManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    try {
      const data = await admin.plans.list()
      setList(Array.isArray(data) ? data : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      name: item.name || '',
      slug: item.slug || '',
      description: item.description || '',
      monthly_fee_brl: String(item.monthly_fee_brl ?? item.price ?? ''),
      billing_cycle: item.billing_cycle || 'monthly',
      trial_days: item.trial_days ?? 0,
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
      allowed_training_days: item.allowed_training_days || '',
      allowed_training_times: item.allowed_training_times || '',
      supported_student_levels: item.supported_student_levels || '',
      allowed_branch_ids: Array.isArray(item.allowed_branch_ids)
        ? item.allowed_branch_ids.join(',')
        : '',
    })
  }

  async function save() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        monthly_fee_brl: form.monthly_fee_brl === '' ? 0 : Number(form.monthly_fee_brl),
        trial_days: Number(form.trial_days) || 0,
        sort_order: Number(form.sort_order) || 0,
        allowed_branch_ids: form.allowed_branch_ids
          ? form.allowed_branch_ids
              .split(',')
              .map((value) => Number(value.trim()))
              .filter((value) => Number.isFinite(value))
          : [],
      }
      if (editing) {
        await admin.plans.update(editing.id, payload)
      } else {
        await admin.plans.create(payload)
      }
      openNew()
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Remover plano?')) return
    try {
      await admin.plans.delete(id)
      if (editing?.id === id) openNew()
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao remover plano')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Planos</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">{editing ? 'Editar plano' : 'Novo plano'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do plano"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Slug (opcional)"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              rows={3}
              placeholder="Descrição"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Mensalidade (BRL)"
                value={form.monthly_fee_brl}
                onChange={(event) => setForm((prev) => ({ ...prev, monthly_fee_brl: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="number"
                placeholder="Dias de teste"
                value={form.trial_days}
                onChange={(event) => setForm((prev) => ({ ...prev, trial_days: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Dias permitidos (ex: segunda,quarta,sexta)"
              value={form.allowed_training_days}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, allowed_training_days: event.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Horários permitidos (ex: 07:00-09:00,18:00-22:00)"
              value={form.allowed_training_times}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, allowed_training_times: event.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Níveis suportados (ex: iniciante,intermediário,avançado)"
              value={form.supported_student_levels}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, supported_student_levels: event.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="IDs de unidades permitidas (ex: 1,2)"
              value={form.allowed_branch_ids}
              onChange={(event) => setForm((prev) => ({ ...prev, allowed_branch_ids: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.billing_cycle}
                onChange={(event) => setForm((prev) => ({ ...prev, billing_cycle: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
              <input
                type="number"
                placeholder="Ordem"
                value={form.sort_order}
                onChange={(event) => setForm((prev) => ({ ...prev, sort_order: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Plano ativo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
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
        </section>

        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Planos cadastrados</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-2">
              {list.map((item) => (
                <li key={item.id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">
                        R$ {Number(item.monthly_fee_brl ?? item.price ?? 0).toFixed(2)} ·{' '}
                        {item.is_active ? 'Ativo' : 'Inativo'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Dias: {item.allowed_training_days || '—'} · Horários:{' '}
                        {item.allowed_training_times || '—'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-2 text-slate-600 hover:text-slate-900"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        aria-label="Remover"
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
    </div>
  )
}
