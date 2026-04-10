import { useEffect, useState } from 'react'
import { studentApi } from '../services/studentApi'

export default function StudentMessagesPage() {
  const [messages, setMessages] = useState([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await studentApi.messages()
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function sendMessage(event) {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      await studentApi.sendMessage({ subject: subject || null, body })
      setSubject('')
      setBody('')
      await load()
    } catch (err) {
      setError(err.message || 'Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section className="bg-white border border-slate-200 rounded-xl shadow p-5">
        <h1 className="text-xl font-semibold text-slate-900 mb-4">Enviar mensagem para administração</h1>
        <form onSubmit={sendMessage} className="space-y-3">
          <input
            type="text"
            placeholder="Assunto (opcional)"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <textarea
            rows={6}
            placeholder="Escreva sua mensagem"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          />
          {error ? <p className="text-red-700 text-sm">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
          >
            {sending ? 'Enviando...' : 'Enviar mensagem'}
          </button>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Histórico de mensagens</h2>
        {loading ? (
          <p className="text-slate-600">Carregando mensagens...</p>
        ) : messages.length === 0 ? (
          <p className="text-slate-600">Nenhuma mensagem no histórico.</p>
        ) : (
          <ul className="space-y-2 max-h-[34rem] overflow-auto">
            {messages.map((message) => (
              <li key={message.id} className="border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-900">{message.subject || 'Sem assunto'}</p>
                <p className="text-xs text-slate-500">
                  {message.sender_role === 'admin' ? 'Administração' : 'Você'} ·{' '}
                  {new Date(message.created_at).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
