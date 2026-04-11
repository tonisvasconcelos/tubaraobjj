import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { admin, uploadFile } from '../../services/adminApi'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function AcademySettingsManage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    main_contact_email: '',
    logo_url: '',
  })

  async function load() {
    setLoading(true)
    try {
      const data = await admin.academySettings.get()
      setForm({
        business_name: data?.business_name || '',
        main_contact_email: data?.main_contact_email || '',
        logo_url: data?.logo_url || '',
      })
    } catch (error) {
      alert(error.message || 'Erro ao carregar configurações da academia')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file)
      setForm((prev) => ({ ...prev, logo_url: url }))
    } catch (error) {
      alert(error.message || 'Erro ao enviar logo')
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    const email = String(form.main_contact_email || '').trim()
    if (email && !isValidEmail(email)) {
      alert('Informe um e-mail principal válido para notificações.')
      return
    }

    setSaving(true)
    try {
      const updated = await admin.academySettings.update({
        business_name: String(form.business_name || '').trim(),
        main_contact_email: email,
        logo_url: String(form.logo_url || '').trim() || null,
      })
      setForm({
        business_name: updated?.business_name || '',
        main_contact_email: updated?.main_contact_email || '',
        logo_url: updated?.logo_url || '',
      })
      alert('Configurações da academia salvas com sucesso.')
    } catch (error) {
      alert(error.message || 'Erro ao salvar configurações da academia')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Academy Settings</h1>
      <section className="bg-white rounded-xl shadow p-6 max-w-xl space-y-4">
        {loading ? (
          <p className="text-slate-500">Carregando...</p>
        ) : (
          <>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Nome da academia</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, business_name: event.target.value }))
                }
                placeholder="Ex: GFTeam Tubarão"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">E-mail principal (notificações)</label>
              <input
                type="email"
                value={form.main_contact_email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, main_contact_email: event.target.value }))
                }
                placeholder="contato@academia.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <p className="mt-1 text-xs text-slate-500">
                Receberá e-mails automáticos quando houver novos agendamentos de aula experimental.
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Logo da academia</label>
              <input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="text-sm"
                disabled={uploading}
              />
              {uploading ? <p className="mt-1 text-xs text-amber-700">Enviando logo...</p> : null}
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo da academia"
                  className="mt-2 h-20 w-20 rounded-lg object-contain bg-slate-50 border border-slate-200"
                />
              ) : null}
            </div>

            <div>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
