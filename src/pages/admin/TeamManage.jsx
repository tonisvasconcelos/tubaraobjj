import { useState, useEffect } from 'react'
import { admin, uploadFile } from '../../services/adminApi'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

export default function TeamManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', role: '', bio: '', photo_url: '', sort_order: 0, is_published: true })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await admin.team.list()
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', role: '', bio: '', photo_url: '', sort_order: list.length, is_published: true })
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name || '',
      role: row.role || '',
      bio: row.bio || '',
      photo_url: row.photo_url || '',
      sort_order: row.sort_order ?? 0,
      is_published: row.is_published !== false,
    })
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file)
      setForm((f) => ({ ...f, photo_url: url }))
    } catch (err) {
      alert(err.message || 'Falha no upload')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) {
        await admin.team.update(editing.id, form)
      } else {
        await admin.team.create(form)
      }
      setEditing(null)
      load()
    } catch (e) {
      alert(e.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Remover este membro?')) return
    try {
      await admin.team.delete(id)
      load()
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      alert(e.message || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Equipe</h1>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px] max-w-md">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? 'Editar' : 'Novo membro'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Função (ex: Professor, Instrutor)"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              placeholder="Currículo / bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              rows={4}
            />
            <div>
              <label className="block text-sm text-slate-600 mb-1">Foto</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="text-sm" disabled={uploading} />
              {uploading && <span className="text-sm text-amber-600 ml-2">Enviando...</span>}
              {form.photo_url && (
                <img src={form.photo_url} alt="" className="mt-2 h-24 w-24 object-cover rounded-lg" />
              )}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              />
              Publicado
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
          <h2 className="font-semibold text-slate-800 mb-4">Membros publicados</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-3">
              {list.map((row) => (
                <li key={row.id} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  {row.photo_url && (
                    <img src={row.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-sm text-slate-500">{row.role}</p>
                  </div>
                  <button type="button" onClick={() => openEdit(row)} className="p-2 text-slate-600 hover:text-slate-900">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => remove(row.id)} className="p-2 text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
