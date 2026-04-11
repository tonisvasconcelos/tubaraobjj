import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { admin } from '../../services/adminApi'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function AcademySettingsManage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    main_contact_email: '',
  })

  async function load() {
    setLoading(true)
    try {
      const data = await admin.academySettings.get()
      setForm({
        business_name: data?.business_name || '',
        main_contact_email: data?.main_contact_email || '',
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
      })
      setForm({
        business_name: updated?.business_name || '',
        main_contact_email: updated?.main_contact_email || '',
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
