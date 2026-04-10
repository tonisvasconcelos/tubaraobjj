import { useEffect, useMemo, useState } from 'react'
import { admin } from '../../services/adminApi'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

const emptyStudentForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  student_level: '',
  status: 'active',
  notes: '',
}

const emptyAssignmentForm = {
  plan_id: '',
  starts_at: '',
  ends_at: '',
  status: 'active',
  custom_monthly_fee_brl: '',
  notes: '',
}

export default function StudentsManage() {
  const [students, setStudents] = useState([])
  const [plans, setPlans] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [studentForm, setStudentForm] = useState(emptyStudentForm)
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm)

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [students, selectedStudentId]
  )

  async function loadBase() {
    setLoading(true)
    try {
      const [studentsData, plansData] = await Promise.all([admin.students.list(), admin.plans.list()])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setPlans(Array.isArray(plansData) ? plansData : [])
      if (!selectedStudentId && Array.isArray(studentsData) && studentsData.length > 0) {
        setSelectedStudentId(studentsData[0].id)
      }
    } catch (error) {
      alert(error.message || 'Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  async function loadAssignments(studentId) {
    if (!studentId) {
      setAssignments([])
      return
    }
    try {
      const data = await admin.assignments.list(studentId)
      setAssignments(Array.isArray(data) ? data : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar vínculos de plano')
    }
  }

  useEffect(() => {
    loadBase()
  }, [])

  useEffect(() => {
    loadAssignments(selectedStudentId)
  }, [selectedStudentId])

  function resetStudentForm() {
    setEditing(null)
    setStudentForm(emptyStudentForm)
  }

  async function saveStudent() {
    setSaving(true)
    try {
      const payload = {
        name: studentForm.name,
        email: studentForm.email,
        phone: studentForm.phone || null,
        student_level: studentForm.student_level || null,
        status: studentForm.status || 'active',
        notes: studentForm.notes || null,
      }
      if (editing) {
        await admin.students.update(editing.id, payload)
      } else {
        if (!studentForm.password) {
          throw new Error('Senha inicial é obrigatória para novo aluno')
        }
        await admin.students.create({ ...payload, password: studentForm.password })
      }
      resetStudentForm()
      await loadBase()
    } catch (error) {
      alert(error.message || 'Erro ao salvar aluno')
    } finally {
      setSaving(false)
    }
  }

  async function removeStudent(id) {
    if (!confirm('Remover aluno? Esta ação também remove mensagens e faturas vinculadas.')) return
    try {
      await admin.students.delete(id)
      if (selectedStudentId === id) setSelectedStudentId(null)
      await loadBase()
    } catch (error) {
      alert(error.message || 'Erro ao remover aluno')
    }
  }

  async function createAssignment() {
    if (!selectedStudentId) {
      alert('Selecione um aluno')
      return
    }
    if (!assignmentForm.plan_id) {
      alert('Selecione um plano')
      return
    }
    try {
      await admin.assignments.create({
        student_id: selectedStudentId,
        plan_id: Number(assignmentForm.plan_id),
        starts_at: assignmentForm.starts_at || null,
        ends_at: assignmentForm.ends_at || null,
        status: assignmentForm.status || 'active',
        custom_monthly_fee_brl:
          assignmentForm.custom_monthly_fee_brl === '' ? null : assignmentForm.custom_monthly_fee_brl,
        notes: assignmentForm.notes || null,
      })
      setAssignmentForm(emptyAssignmentForm)
      await loadAssignments(selectedStudentId)
    } catch (error) {
      alert(error.message || 'Erro ao vincular plano')
    }
  }

  async function toggleAssignmentStatus(assignment) {
    try {
      const nextStatus = assignment.status === 'active' ? 'inactive' : 'active'
      await admin.assignments.update(assignment.id, {
        status: nextStatus,
        ends_at: nextStatus === 'inactive' ? new Date().toISOString() : assignment.ends_at,
      })
      await loadAssignments(selectedStudentId)
    } catch (error) {
      alert(error.message || 'Erro ao atualizar vínculo')
    }
  }

  async function resetPassword(studentId) {
    const password = prompt('Digite a nova senha do aluno:')
    if (!password) return
    try {
      await admin.students.resetPassword(studentId, password)
      alert('Senha atualizada com sucesso.')
    } catch (error) {
      alert(error.message || 'Erro ao redefinir senha')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Alunos</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">{editing ? 'Editar aluno' : 'Novo aluno'}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome completo"
              value={studentForm.name}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={studentForm.email}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            {!editing && (
              <input
                type="password"
                placeholder="Senha inicial"
                value={studentForm.password}
                onChange={(event) => setStudentForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            )}
            <input
              type="text"
              placeholder="Telefone"
              value={studentForm.phone}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Nível (iniciante, intermediário...)"
              value={studentForm.student_level}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, student_level: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <select
              value={studentForm.status}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            <textarea
              rows={3}
              placeholder="Observações"
              value={studentForm.notes}
              onChange={(event) => setStudentForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveStudent}
                disabled={saving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Atualizar' : 'Criar'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetStudentForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                >
                  Novo
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-5 xl:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-4">Cadastro de alunos</h2>
          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <ul className="space-y-3">
              {students.map((student) => (
                <li
                  key={student.id}
                  className={`border rounded-lg p-3 ${
                    selectedStudentId === student.id ? 'border-slate-500 bg-slate-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className="text-left flex-1"
                    >
                      <p className="font-medium text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-600">{student.email}</p>
                      <p className="text-xs text-slate-500">
                        {student.status === 'active' ? 'Ativo' : 'Inativo'} · {student.student_level || 'Nível não informado'}
                      </p>
                    </button>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(student)
                          setStudentForm({
                            name: student.name || '',
                            email: student.email || '',
                            password: '',
                            phone: student.phone || '',
                            student_level: student.student_level || '',
                            status: student.status || 'active',
                            notes: student.notes || '',
                          })
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900"
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => resetPassword(student.id)}
                        className="px-2 text-xs border border-slate-300 rounded hover:bg-slate-100"
                      >
                        Senha
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && students.length === 0 && (
            <p className="text-sm text-slate-500">Nenhum aluno cadastrado.</p>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Vincular plano ao aluno</h2>
          {!selectedStudent ? (
            <p className="text-sm text-slate-500">Selecione um aluno para criar vínculo de plano.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Aluno selecionado: <strong>{selectedStudent.name}</strong>
              </p>
              <select
                value={assignmentForm.plan_id}
                onChange={(event) =>
                  setAssignmentForm((prev) => ({ ...prev, plan_id: event.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="">Selecione o plano</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · R$ {Number(plan.monthly_fee_brl ?? plan.price ?? 0).toFixed(2)}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={assignmentForm.starts_at}
                  onChange={(event) =>
                    setAssignmentForm((prev) => ({ ...prev, starts_at: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
                <input
                  type="datetime-local"
                  value={assignmentForm.ends_at}
                  onChange={(event) =>
                    setAssignmentForm((prev) => ({ ...prev, ends_at: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Mensalidade customizada (opcional)"
                value={assignmentForm.custom_monthly_fee_brl}
                onChange={(event) =>
                  setAssignmentForm((prev) => ({
                    ...prev,
                    custom_monthly_fee_brl: event.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <textarea
                rows={2}
                placeholder="Observações do vínculo"
                value={assignmentForm.notes}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <button
                type="button"
                onClick={createAssignment}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Vincular plano
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Planos vinculados</h2>
          {!selectedStudent ? (
            <p className="text-sm text-slate-500">Selecione um aluno para visualizar vínculos.</p>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum plano vinculado para este aluno.</p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="border border-slate-200 rounded-lg p-3">
                  <p className="font-medium text-slate-900">{assignment.plan_name}</p>
                  <p className="text-sm text-slate-600">
                    Status: {assignment.status} · Início:{' '}
                    {assignment.starts_at ? new Date(assignment.starts_at).toLocaleString('pt-BR') : '—'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Mensalidade:{' '}
                    {Number(
                      assignment.custom_monthly_fee_brl ?? assignment.plan_monthly_fee_brl ?? 0
                    ).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => toggleAssignmentStatus(assignment)}
                      className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                    >
                      {assignment.status === 'active' ? 'Encerrar vínculo' : 'Reativar vínculo'}
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
