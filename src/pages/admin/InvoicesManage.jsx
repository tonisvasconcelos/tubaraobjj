import { useEffect, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2 } from 'lucide-react'

const emptyForm = {
  student_id: '',
  plan_assignment_id: '',
  reference_month: '',
  due_date: '',
  amount_brl: '',
  status: 'open',
  notes: '',
}

export default function InvoicesManage() {
  const [invoices, setInvoices] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [invoicesData, studentsData, assignmentsData] = await Promise.all([
        admin.invoices.list(),
        admin.students.list(),
        admin.assignments.list(),
      ])
      setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar faturas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function createInvoice() {
    setSaving(true)
    try {
      if (!form.student_id || !form.reference_month || form.amount_brl === '') {
        throw new Error('Aluno, mês de referência e valor são obrigatórios')
      }
      await admin.invoices.create({
        student_id: Number(form.student_id),
        plan_assignment_id: form.plan_assignment_id ? Number(form.plan_assignment_id) : null,
        reference_month: form.reference_month,
        due_date: form.due_date || null,
        amount_brl: Number(form.amount_brl),
        status: form.status || 'open',
        notes: form.notes || null,
      })
      setForm(emptyForm)
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao criar fatura')
    } finally {
      setSaving(false)
    }
  }

  async function updateInvoiceStatus(invoice, status) {
    try {
      await admin.invoices.update(invoice.id, {
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        payment_method: status === 'paid' ? 'manual' : null,
        notes: invoice.notes,
      })
      await load()
    } catch (error) {
      alert(error.message || 'Erro ao atualizar fatura')
    }
  }

  const studentAssignments = assignments.filter(
    (assignment) => Number(assignment.student_id) === Number(form.student_id)
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Faturas mensais</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl shadow p-5 xl:col-span-1">
          <h2 className="font-semibold text-slate-900 mb-4">Nova fatura</h2>
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
            <select
              value={form.plan_assignment_id}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, plan_assignment_id: event.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="">Vínculo de plano (opcional)</option>
              {studentAssignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  #{assignment.id} · {assignment.plan_name} · {assignment.status}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={form.reference_month}
              onChange={(event) => setForm((prev) => ({ ...prev, reference_month: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="date"
              value={form.due_date}
              onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor em BRL"
              value={form.amount_brl}
              onChange={(event) => setForm((prev) => ({ ...prev, amount_brl: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="open">Em aberto</option>
              <option value="paid">Paga</option>
              <option value="void">Cancelada</option>
            </select>
            <textarea
              rows={2}
              placeholder="Observações"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={createInvoice}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar fatura
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-5 xl:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-4">Controle de pagamentos</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma fatura cadastrada.</p>
          ) : (
            <ul className="space-y-2 max-h-[36rem] overflow-auto">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">
                    {invoice.student_name} ·{' '}
                    {Number(invoice.amount_brl || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    Referência: {new Date(invoice.reference_month).toLocaleDateString('pt-BR')} ·
                    Vencimento:{' '}
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Status: {invoice.status}
                    {invoice.paid_at
                      ? ` · Pago em ${new Date(invoice.paid_at).toLocaleString('pt-BR')}`
                      : ''}
                  </p>
                  {invoice.notes && <p className="text-sm text-slate-700 mt-1">{invoice.notes}</p>}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateInvoiceStatus(invoice, 'open')}
                      className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      Em aberto
                    </button>
                    <button
                      type="button"
                      onClick={() => updateInvoiceStatus(invoice, 'paid')}
                      className="text-xs px-3 py-1 border border-green-300 text-green-700 rounded hover:bg-green-50"
                    >
                      Marcar paga
                    </button>
                    <button
                      type="button"
                      onClick={() => updateInvoiceStatus(invoice, 'void')}
                      className="text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Cancelar
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
