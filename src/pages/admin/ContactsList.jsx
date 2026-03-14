import { useState, useEffect } from 'react'
import { admin } from '../../services/adminApi'
import { Mail, Phone, User, MessageSquare } from 'lucide-react'

export default function ContactsList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await admin.contacts.list()
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    try {
      await admin.contacts.markRead(id)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Contatos recebidos</h1>
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? (
          <p className="text-slate-500">Carregando...</p>
        ) : list.length === 0 ? (
          <p className="text-slate-500">Nenhuma mensagem ainda.</p>
        ) : (
          <ul className="space-y-4">
            {list.map((row) => (
              <li
                key={row.id}
                className={`border rounded-lg p-4 ${row.read_at ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900">{row.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(row.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <a href={`mailto:${row.email}`} className="flex items-center gap-1 hover:text-slate-900">
                    <Mail className="w-4 h-4" />
                    {row.email}
                  </a>
                  {row.phone && (
                    <a href={`tel:${row.phone}`} className="flex items-center gap-1 hover:text-slate-900">
                      <Phone className="w-4 h-4" />
                      {row.phone}
                    </a>
                  )}
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700 whitespace-pre-wrap">{row.message}</p>
                </div>
                {!row.read_at && (
                  <button
                    type="button"
                    onClick={() => markRead(row.id)}
                    className="mt-2 text-sm text-slate-600 hover:text-slate-900 underline"
                  >
                    Marcar como lido
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
