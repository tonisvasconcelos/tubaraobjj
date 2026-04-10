import { useEffect, useMemo, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2 } from 'lucide-react'

const emptyForm = {
  student_id: '',
  subject: '',
  body: '',
}

export default function StudentMessagesManage() {
  const [messages, setMessages] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterStudentId, setFilterStudentId] = useState('')

  const filteredMessages = useMemo(() => {
    if (!filterStudentId) return messages
    return messages.filter((message) => Number(message.student_id) === Number(filterStudentId))
  }, [messages, filterStudentId])

  async function load() {
    setLoading(true)
    try {
      const [messagesData, studentsData] = await Promise.all([
        admin.studentMessages.list(),
        admin.students.list(),
      ])
      setMessages(Array.isArray(messagesData) ? messagesData : [])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function sendMessage() {
    setSaving(true)
    try {
      if (!form.student_id || !form.body) {
        throw new Error('Aluno e mensagem são obrigatórios')
      }
      await admin.studentMessages.create({
        student_id: Number(form.student_id),
        subject: form.subject || null,
        body: form.body,
      })
      setForm(emptyForm)
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao enviar mensagem')
    } finally {
      setSaving(false)
    }
  }

  async function markRead(messageId) {
    try {
      await admin.studentMessages.markRead(messageId)
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao marcar mensagem')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mensagens dos Alunos</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl shadow p-5 xl:col-span-1">
          <h2 className="font-semibold text-slate-900 mb-4">Nova mensagem para aluno</h2>
          <div className="space-y-3">
            <select
              value={form.student_id}
              onChange={(event) => setForm((prev) => ({ ...prev, student_id: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="">Selecione o aluno</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Assunto (opcional)"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <textarea
              rows={5}
              placeholder="Mensagem"
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar mensagem
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-slate-900">Inbox de mensagens</h2>
            <select
              value={filterStudentId}
              onChange={(event) => setFilterStudentId(event.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="">Todos os alunos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma mensagem encontrada.</p>
          ) : (
            <ul className="space-y-2 max-h-[36rem] overflow-auto">
              {filteredMessages.map((message) => (
                <li key={message.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">
                    {message.subject || 'Mensagem sem assunto'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {message.student_name} ({message.student_email}) · {message.sender_role}
                  </p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{message.body}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(message.created_at).toLocaleString('pt-BR')} ·{' '}
                    {message.read_at ? `Lida em ${new Date(message.read_at).toLocaleString('pt-BR')}` : 'Não lida'}
                  </p>
                  {!message.read_at && (
                    <button
                      type="button"
                      onClick={() => markRead(message.id)}
                      className="mt-2 text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Marcar como lida
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
