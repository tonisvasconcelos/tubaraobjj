import { useEffect, useState } from 'react'
import { admin } from '../../services/adminApi'

const initialForm = {
  term_key: 'privacy',
  locale: 'pt-BR',
  title: '',
  content: '',
  version: 1,
  is_active: false,
}

export default function WebsiteTermsManage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  async function load() {
    setLoading(true)
    try {
      const data = await admin.websiteTerms.list()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar termos do site')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startCreate() {
    setEditingId(null)
    setForm(initialForm)
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({
      term_key: item.term_key || 'privacy',
      locale: item.locale || 'pt-BR',
      title: item.title || '',
      content: item.content || '',
      version: item.version || 1,
      is_active: item.is_active === true,
    })
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Título e conteúdo são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        publish_now: form.is_active,
      }
      if (editingId) {
        await admin.websiteTerms.update(editingId, payload)
      } else {
        await admin.websiteTerms.create(payload)
      }
      startCreate()
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao salvar termo')
    } finally {
      setSaving(false)
    }
  }

  async function publish(item) {
    try {
      await admin.websiteTerms.publish(item.id)
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao publicar termo')
    }
  }

  async function remove(item) {
    if (!confirm(`Remover versão ${item.version} de ${item.term_key}?`)) return
    try {
      await admin.websiteTerms.delete(item.id)
      if (editingId === item.id) startCreate()
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao remover termo')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Registro de Termos do Site</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">
            {editingId ? 'Editar termo' : 'Novo termo / versão'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={form.term_key}
              onChange={(event) => setForm((prev) => ({ ...prev, term_key: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="privacy">privacy</option>
              <option value="terms">terms</option>
            </select>
            <input
              type="text"
              value={form.locale}
              onChange={(event) => setForm((prev) => ({ ...prev, locale: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="pt-BR"
            />
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            placeholder="Título"
          />
          <textarea
            rows={8}
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            placeholder="Conteúdo do termo"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              min={1}
              value={form.version}
              onChange={(event) => setForm((prev) => ({ ...prev, version: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="Versão"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, is_active: event.target.checked }))
                }
              />
              Publicar como ativa
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={startCreate}
                className="px-4 py-2 border border-slate-300 rounded-lg"
              >
                Novo
              </button>
            ) : null}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Versões cadastradas</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500">Nenhum termo cadastrado.</p>
          ) : (
            <ul className="space-y-2 max-h-[36rem] overflow-auto">
              {items.map((item) => (
                <li key={item.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">
                    {item.term_key} · v{item.version} · {item.locale}
                  </p>
                  <p className="text-sm text-slate-700">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.is_active ? 'Ativo no site' : 'Inativo'}
                    {item.published_at
                      ? ` · Publicado em ${new Date(item.published_at).toLocaleString('pt-BR')}`
                      : ''}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    {!item.is_active ? (
                      <button
                        type="button"
                        onClick={() => publish(item)}
                        className="text-xs px-3 py-1 border border-emerald-300 text-emerald-700 rounded hover:bg-emerald-50"
                      >
                        Publicar
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Remover
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
