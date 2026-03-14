import { useState, useEffect } from 'react'
import { admin, uploadFile } from '../../services/adminApi'
import { Pencil, Trash2, Loader2, Plus } from 'lucide-react'

const emptyVariant = { color: '', size: '', stock_quantity: 0 }

export default function ProductsManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    image_url: '',
    price: 0,
    whatsapp_link: '',
    sort_order: 0,
    is_published: true,
    variants: [{ ...emptyVariant }],
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await admin.products.list()
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
      description: '',
      image_url: '',
      price: 0,
      whatsapp_link: '',
      sort_order: list.length,
      is_published: true,
      variants: [{ ...emptyVariant }],
    })
  }

  const openEdit = (row) => {
    setEditing(row)
    const variants = (row.variants && row.variants.length) ? row.variants.map((v) => ({ color: v.color || '', size: v.size || '', stock_quantity: v.stock_quantity ?? 0 })) : [{ ...emptyVariant }]
    setForm({
      name: row.name || '',
      description: row.description || '',
      image_url: row.image_url || '',
      price: parseFloat(row.price) || 0,
      whatsapp_link: row.whatsapp_link || '',
      sort_order: row.sort_order ?? 0,
      is_published: row.is_published !== false,
      variants,
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

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }))
  }

  const updateVariant = (index, field, value) => {
    setForm((f) => {
      const v = [...f.variants]
      v[index] = { ...v[index], [field]: value }
      return { ...f, variants: v }
    })
  }

  const removeVariant = (index) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        image_url: form.image_url || null,
        price: form.price,
        whatsapp_link: form.whatsapp_link || null,
        sort_order: form.sort_order,
        is_published: form.is_published,
        variants: form.variants.filter((v) => v.color || v.size || v.stock_quantity > 0),
      }
      if (editing) {
        await admin.products.update(editing.id, payload)
      } else {
        await admin.products.create(payload)
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
    if (!confirm('Remover este produto?')) return
    try {
      await admin.products.delete(id)
      load()
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      alert(e.message || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Loja</h1>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[280px] max-w-lg">
          <h2 className="font-semibold text-slate-800 mb-4">{editing ? 'Editar produto' : 'Novo produto'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do produto"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              placeholder="Descrição"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              rows={2}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Preço"
              value={form.price || ''}
              onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Link WhatsApp (para comprar)"
              value={form.whatsapp_link}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp_link: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div>
              <label className="block text-sm text-slate-600 mb-1">Imagem</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="text-sm" disabled={uploading} />
              {uploading && <span className="text-sm text-amber-600 ml-2">Enviando...</span>}
              {form.image_url && (
                <img src={form.image_url} alt="" className="mt-2 h-24 w-24 object-cover rounded-lg" />
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Variantes (cor, tamanho, estoque)</span>
                <button type="button" onClick={addVariant} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
              {form.variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <input
                    placeholder="Cor"
                    value={v.color}
                    onChange={(e) => updateVariant(i, 'color', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Tamanho"
                    value={v.size}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Qtd"
                    value={v.stock_quantity}
                    onChange={(e) => updateVariant(i, 'stock_quantity', parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-600 text-sm">Remover</button>
                </div>
              ))}
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
          <h2 className="font-semibold text-slate-800 mb-4">Produtos</h2>
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
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-sm text-slate-500">R$ {parseFloat(row.price).toFixed(2)}</p>
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
