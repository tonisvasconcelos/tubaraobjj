import { useState, useEffect } from 'react'
import { admin, uploadFile } from '../../services/adminApi'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

export default function BranchesManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    photo_url: '',
    latitude: '',
    longitude: '',
    sort_order: 0,
    is_published: true,
    has_parking: false,
    parking_address: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await admin.branches.list()
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
      name: '',
      address: '',
      photo_url: '',
      latitude: '',
      longitude: '',
      sort_order: list.length,
      is_published: true,
      has_parking: false,
      parking_address: '',
    })
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name || '',
      address: row.address || '',
      photo_url: row.photo_url || '',
      latitude: row.latitude == null ? '' : String(row.latitude),
      longitude: row.longitude == null ? '' : String(row.longitude),
      sort_order: row.sort_order ?? 0,
      is_published: row.is_published !== false,
      has_parking: Boolean(row.has_parking),
      parking_address: row.parking_address || '',
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
        await admin.branches.update(editing.id, form)
      } else {
        await admin.branches.create(form)
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
    if (!confirm('Remover esta unidade?')) return
    try {
      await admin.branches.delete(id)
      load()
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      alert(e.message || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Unidades</h1>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px] max-w-md">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? 'Editar' : 'Nova unidade'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome (ex: Vila Isabel - Sede)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              placeholder="Endereço completo"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              rows={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                step="0.000001"
                placeholder="Latitude (ex: -22.912160)"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="number"
                step="0.000001"
                placeholder="Longitude (ex: -43.230182)"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-500">
              Dica: no Google Maps, clique no ponto do mapa para copiar latitude/longitude.
            </p>
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
                checked={form.has_parking}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    has_parking: e.target.checked,
                    parking_address: e.target.checked ? f.parking_address : '',
                  }))
                }
              />
              Há estacionamento próximo
            </label>
            {form.has_parking ? (
              <textarea
                placeholder="Endereço do estacionamento (próximo à unidade)"
                value={form.parking_address}
                onChange={(e) => setForm((f) => ({ ...f, parking_address: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                rows={2}
              />
            ) : null}
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
          <h2 className="font-semibold text-slate-800 mb-4">Unidades</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-3">
              {list.map((row) => (
                <li key={row.id} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  {row.photo_url && (
                    <img src={row.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-sm text-slate-500">{row.address}</p>
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
