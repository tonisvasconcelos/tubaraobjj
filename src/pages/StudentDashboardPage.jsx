import { useEffect, useState } from 'react'
import { studentApi } from '../services/studentApi'

export default function StudentDashboardPage() {
  const [me, setMe] = useState(null)
  const [plan, setPlan] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [meData, planData, invoicesData] = await Promise.all([
          studentApi.me(),
          studentApi.planStatus(),
          studentApi.invoices(),
        ])
        setMe(meData)
        setPlan(planData)
        setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      } catch (err) {
        setError(err.message || 'Erro ao carregar área do aluno')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="text-slate-600">Carregando dados do aluno...</p>
  if (error) return <p className="text-red-700">{error}</p>

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl shadow p-5">
        <h1 className="text-2xl font-bold text-slate-900">Olá, {me?.name || 'Aluno'}!</h1>
        <p className="text-slate-600">
          Email: {me?.email || '—'} · Nível: {me?.student_level || 'Não informado'} · Status:{' '}
          {me?.status || '—'}
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Status do plano</h2>
        {!plan ? (
          <p className="text-slate-600">Nenhum plano ativo vinculado no momento.</p>
        ) : (
          <div className="space-y-1 text-slate-700">
            <p>
              <strong>Plano:</strong> {plan.plan_name}
            </p>
            <p>
              <strong>Status:</strong> {plan.status}
            </p>
            <p>
              <strong>Mensalidade:</strong>{' '}
              {Number(plan.custom_monthly_fee_brl ?? plan.plan_monthly_fee_brl ?? 0).toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                }
              )}
            </p>
            <p>
              <strong>Dias permitidos:</strong> {plan.allowed_training_days || '—'}
            </p>
            <p>
              <strong>Horários permitidos:</strong> {plan.allowed_training_times || '—'}
            </p>
            <p>
              <strong>Níveis suportados:</strong> {plan.supported_student_levels || '—'}
            </p>
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">Mensalidades e faturas</h2>
        {invoices.length === 0 ? (
          <p className="text-slate-600">Nenhuma fatura cadastrada até o momento.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-900">
                  {new Date(invoice.reference_month).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-slate-600">
                  Valor:{' '}
                  {Number(invoice.amount_brl || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <p className="text-sm text-slate-600">
                  Status: {invoice.status}
                  {invoice.paid_at
                    ? ` · Pago em ${new Date(invoice.paid_at).toLocaleString('pt-BR')}`
                    : ''}
                </p>
                {invoice.due_date ? (
                  <p className="text-xs text-slate-500">
                    Vencimento: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
