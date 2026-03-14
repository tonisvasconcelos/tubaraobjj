import { useState, useEffect } from 'react'
import { admin, uploadFile } from '../../services/adminApi'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

const CATEGORIES = [{ value: 'training', label: 'Treino' }, { value: 'competition', label: 'Competição' }, { value: 'event', label: 'Evento' }]

export default function GalleryManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', image_url: '', category: 'training', sort_order: 0, is_published: true })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await admin.gallery.list()
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
    setForm({ title: '', image_url: '', category: 'training', sort_order: list.length, is_published: true })
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      title: row.title || '',
      image_url: row.image_url || '',
      category: row.category || 'training',
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
      setForm((f) => ({ ...f, image_url: url }))
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
        await admin.gallery.update(editing.id, form)
      } else {
        await admin.gallery.create(form)
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
    if (!confirm('Remover esta imagem da galeria?')) return
    try {
      await admin.gallery.delete(id)
      load()
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      alert(e.message || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Galeria</h1>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px] max-w-md">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? 'Editar' : 'Nova imagem'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Imagem</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="text-sm" disabled={uploading} />
              {uploading && <span className="text-sm text-amber-600 ml-2">Enviando...</span>}
              {form.image_url && (
                <img src={form.image_url} alt="" className="mt-2 h-32 w-full object-cover rounded-lg" />
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
                disabled={saving || !form.image_url}
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
          <h2 className="font-semibold text-slate-800 mb-4">Imagens</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {list.map((row) => (
                <div key={row.id} className="relative group">
                  <img src={row.image_url} alt={row.title || ''} className="w-full aspect-square object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button type="button" onClick={() => openEdit(row)} className="p-2 bg-white rounded-full text-slate-800">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => remove(row.id)} className="p-2 bg-white rounded-full text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
