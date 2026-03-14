import { useState, useEffect } from 'react'
import { admin, uploadFile } from '../../services/adminApi'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

const TYPES = [
  { value: 'Testimonial', label: 'Depoimento' },
  { value: 'Achievement', label: 'Conquista' },
  { value: 'Seminar', label: 'Seminário' },
  { value: 'News', label: 'Notícia' },
]

export default function HighlightsManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    type: 'News',
    title: '',
    content: '',
    image_url: '',
    author: '',
    sort_order: 0,
    is_published: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await admin.highlights.list()
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
    setForm({
      type: 'News',
      title: '',
      content: '',
      image_url: '',
      author: '',
      sort_order: list.length,
      is_published: true,
    })
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      type: row.type || 'News',
      title: row.title || '',
      content: row.content || '',
      image_url: row.image_url || '',
      author: row.author || '',
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
        await admin.highlights.update(editing.id, form)
      } else {
        await admin.highlights.create(form)
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
    if (!confirm('Remover este destaque?')) return
    try {
      await admin.highlights.delete(id)
      load()
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      alert(e.message || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Destaques (home)</h1>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px] max-w-md">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? 'Editar' : 'Novo destaque'}</h2>
          <div className="space-y-3">
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              placeholder="Texto / conteúdo"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              rows={3}
            />
            <input
              type="text"
              placeholder="Autor (opcional)"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div>
              <label className="block text-sm text-slate-600 mb-1">Imagem</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="text-sm" disabled={uploading} />
              {uploading && <span className="text-sm text-amber-600 ml-2">Enviando...</span>}
              {form.image_url && (
                <img src={form.image_url} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" />
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
          <h2 className="font-semibold text-slate-800 mb-4">Destaques</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-3">
              {list.map((row) => (
                <li key={row.id} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  {row.image_url && (
                    <img src={row.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{row.title}</p>
                    <p className="text-sm text-slate-500">{row.type}</p>
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
