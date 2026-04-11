import { useEffect, useMemo, useState } from 'react'
import { admin } from '../../services/adminApi'

const initialTemplateForm = {
  name: '',
  description: '',
  version: 1,
  is_active: false,
}

const initialQuestionForm = {
  question_key: '',
  label: '',
  sort_order: 0,
  question_type: 'boolean',
  is_required: true,
  options_text: '',
}

function formatAnswerValue(answer) {
  if (answer.answer_boolean != null) return answer.answer_boolean ? 'Sim' : 'Não'
  if (answer.answer_option) return answer.answer_option
  if (answer.answer_text) return answer.answer_text
  return '-'
}

export default function MedicalQuestionnaireManage() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [questions, setQuestions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [templateForm, setTemplateForm] = useState(initialTemplateForm)
  const [questionForm, setQuestionForm] = useState(initialQuestionForm)

  const selectedTemplate = useMemo(
    () => templates.find((item) => String(item.id) === String(selectedTemplateId)) || null,
    [templates, selectedTemplateId]
  )

  async function loadAll() {
    setLoading(true)
    try {
      const [templatesData, submissionsData] = await Promise.all([
        admin.medicalQuestionnaire.listTemplates(),
        admin.medicalQuestionnaire.listSubmissions(),
      ])
      const safeTemplates = Array.isArray(templatesData) ? templatesData : []
      setTemplates(safeTemplates)
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : [])
      if (!selectedTemplateId && safeTemplates.length > 0) {
        setSelectedTemplateId(String(safeTemplates[0].id))
      }
    } catch (error) {
      alert(error.message || 'Erro ao carregar questionário médico')
    } finally {
      setLoading(false)
    }
  }

  async function loadQuestions(templateId) {
    if (!templateId) {
      setQuestions([])
      return
    }
    try {
      const data = await admin.medicalQuestionnaire.listQuestions(templateId)
      setQuestions(Array.isArray(data) ? data : [])
    } catch (error) {
      alert(error.message || 'Erro ao carregar perguntas')
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    loadQuestions(selectedTemplateId)
  }, [selectedTemplateId])

  async function saveTemplate() {
    if (!templateForm.name.trim()) {
      alert('Nome do template é obrigatório.')
      return
    }
    try {
      await admin.medicalQuestionnaire.createTemplate({
        ...templateForm,
        version: Number(templateForm.version) || 1,
        publish_now: templateForm.is_active,
      })
      setTemplateForm(initialTemplateForm)
      await loadAll()
    } catch (error) {
      alert(error.message || 'Erro ao salvar template')
    }
  }

  async function activateTemplate(id) {
    try {
      await admin.medicalQuestionnaire.activateTemplate(id)
      await loadAll()
    } catch (error) {
      alert(error.message || 'Erro ao ativar template')
    }
  }

  async function saveQuestion() {
    if (!selectedTemplateId) {
      alert('Selecione um template.')
      return
    }
    if (!questionForm.question_key.trim() || !questionForm.label.trim()) {
      alert('question_key e label são obrigatórios.')
      return
    }
    const options =
      questionForm.question_type === 'single_choice'
        ? questionForm.options_text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : []
    try {
      await admin.medicalQuestionnaire.createQuestion({
        template_id: Number(selectedTemplateId),
        question_key: questionForm.question_key.trim(),
        label: questionForm.label.trim(),
        sort_order: Number(questionForm.sort_order) || 0,
        question_type: questionForm.question_type,
        is_required: questionForm.is_required,
        options_json: options,
      })
      setQuestionForm(initialQuestionForm)
      await loadQuestions(selectedTemplateId)
    } catch (error) {
      alert(error.message || 'Erro ao salvar pergunta')
    }
  }

  async function removeQuestion(id) {
    if (!confirm('Remover esta pergunta?')) return
    try {
      await admin.medicalQuestionnaire.deleteQuestion(id)
      await loadQuestions(selectedTemplateId)
    } catch (error) {
      alert(error.message || 'Erro ao remover pergunta')
    }
  }

  async function removeTemplate(id) {
    if (!confirm('Remover este template e suas perguntas?')) return
    try {
      await admin.medicalQuestionnaire.deleteTemplate(id)
      if (String(selectedTemplateId) === String(id)) setSelectedTemplateId('')
      await loadAll()
    } catch (error) {
      alert(error.message || 'Erro ao remover template')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Questionário Médico</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={templateForm.name}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nome do template"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="number"
              min={1}
              value={templateForm.version}
              onChange={(event) =>
                setTemplateForm((prev) => ({ ...prev, version: event.target.value }))
              }
              placeholder="Versão"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <textarea
            rows={3}
            value={templateForm.description}
            onChange={(event) =>
              setTemplateForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Descrição"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={templateForm.is_active}
              onChange={(event) =>
                setTemplateForm((prev) => ({ ...prev, is_active: event.target.checked }))
              }
            />
            Criar já ativo
          </label>
          <button
            type="button"
            onClick={saveTemplate}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Criar template
          </button>

          <div className="border-t pt-4">
            {loading ? (
              <p className="text-slate-500">Carregando templates...</p>
            ) : templates.length === 0 ? (
              <p className="text-slate-500">Nenhum template cadastrado.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-auto">
                {templates.map((item) => (
                  <li key={item.id} className="border border-slate-200 rounded-lg p-3">
                    <p className="font-medium text-slate-900">
                      {item.name} · v{item.version}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.is_active ? 'Ativo no site' : 'Inativo'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(String(item.id))}
                        className="text-xs px-3 py-1 border border-slate-300 rounded hover:bg-slate-100"
                      >
                        Gerenciar perguntas
                      </button>
                      {!item.is_active ? (
                        <button
                          type="button"
                          onClick={() => activateTemplate(item.id)}
                          className="text-xs px-3 py-1 border border-emerald-300 text-emerald-700 rounded hover:bg-emerald-50"
                        >
                          Ativar
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeTemplate(item.id)}
                        className="text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">
            Perguntas {selectedTemplate ? `· ${selectedTemplate.name}` : ''}
          </h2>
          {!selectedTemplate ? (
            <p className="text-slate-500">Selecione um template para gerenciar perguntas.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={questionForm.question_key}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({ ...prev, question_key: event.target.value }))
                  }
                  placeholder="question_key"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
                <input
                  type="number"
                  value={questionForm.sort_order}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({ ...prev, sort_order: event.target.value }))
                  }
                  placeholder="Ordem"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
                <select
                  value={questionForm.question_type}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({ ...prev, question_type: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="boolean">boolean</option>
                  <option value="text">text</option>
                  <option value="single_choice">single_choice</option>
                </select>
              </div>
              <input
                type="text"
                value={questionForm.label}
                onChange={(event) =>
                  setQuestionForm((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="Label da pergunta"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              {questionForm.question_type === 'single_choice' ? (
                <textarea
                  rows={3}
                  value={questionForm.options_text}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({ ...prev, options_text: event.target.value }))
                  }
                  placeholder="Opções (uma por linha)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={questionForm.is_required}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({ ...prev, is_required: event.target.checked }))
                  }
                />
                Obrigatória
              </label>
              <button
                type="button"
                onClick={saveQuestion}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Adicionar pergunta
              </button>
              <ul className="space-y-2 max-h-64 overflow-auto border-t pt-4">
                {questions.map((question) => (
                  <li key={question.id} className="border border-slate-200 rounded-lg p-3">
                    <p className="font-medium text-slate-900">
                      {question.sort_order}. {question.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {question.question_key} · {question.question_type} ·{' '}
                      {question.is_required ? 'Obrigatória' : 'Opcional'}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="mt-2 text-xs px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="font-semibold text-slate-900 mb-4">Submissões do questionário médico</h2>
        {loading ? (
          <p className="text-slate-500">Carregando...</p>
        ) : submissions.length === 0 ? (
          <p className="text-slate-500">Nenhuma submissão registrada.</p>
        ) : (
          <ul className="space-y-2 max-h-[34rem] overflow-auto">
            {submissions.map((submission) => (
              <li key={submission.id} className="border border-slate-200 rounded-lg p-3">
                <p className="font-medium text-slate-900">
                  {submission.lead_name || 'Lead sem nome'} · {submission.template_name} v
                  {submission.template_version}
                </p>
                <p className="text-xs text-slate-500">
                  {submission.lead_email || '-'} · {submission.lead_phone || '-'} ·{' '}
                  {new Date(submission.submitted_at).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500">
                  Terms aceitos: {submission.terms_accepted ? 'Sim' : 'Não'}
                </p>
                <div className="mt-2 text-xs text-slate-700 space-y-1">
                  {(submission.answers || []).map((answer) => (
                    <p key={`${submission.id}-${answer.question_key}`}>
                      <strong>{answer.question_key}:</strong> {formatAnswerValue(answer)}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
