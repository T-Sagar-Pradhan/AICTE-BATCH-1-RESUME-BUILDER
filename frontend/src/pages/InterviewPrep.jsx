import { useState, useEffect } from 'react'
import { Brain, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { interviewAPI, resumesAPI } from '../services/api'
import toast from 'react-hot-toast'

const ROLES = ['Software Engineer', 'Full Stack Developer', 'Data Analyst', 'ML Engineer', 'Product Manager', 'DevOps Engineer']

export default function InterviewPrep() {
  const [form, setForm] = useState({ target_role: '', difficulty: 'intermediate', question_types: ['technical', 'hr'], resume_id: '', num_questions: 10 })
  const [sessions, setSessions] = useState([])
  const [resumes, setResumes] = useState([])
  const [active, setActive] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [openQ, setOpenQ] = useState(null)

  useEffect(() => {
    interviewAPI.listSessions().then(r => setSessions(r.data)).catch(() => {})
    resumesAPI.list().then(r => setResumes(r.data)).catch(() => {})
  }, [])

  const generate = async () => {
    if (!form.target_role) { toast.error('Select a role'); return }
    setGenerating(true)
    try {
      const res = await interviewAPI.generate(form)
      setActive(res.data)
      setSessions(prev => [res.data, ...prev])
      toast.success(`${res.data.questions?.length || 0} questions generated!`)
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed. Add GEMINI_API_KEY.') }
    finally { setGenerating(false) }
  }

  const toggleType = (t) => setForm(p => ({ ...p, question_types: p.question_types.includes(t) ? p.question_types.filter(x => x !== t) : [...p.question_types, t] }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2"><Brain size={22} className="text-pink-400" /> Interview Prep</h1>
        <p className="text-dark-400 text-sm">AI-generated interview questions for your target role</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold text-dark-100 text-sm">Configure</h3>
            <select className="input text-sm" value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))}>
              <option value="">Select role...</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <div className="flex gap-1.5">
              {['beginner', 'intermediate', 'advanced'].map(d => (
                <button key={d} onClick={() => setForm(p => ({ ...p, difficulty: d }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize ${form.difficulty === d ? 'border-brand-500/50 bg-brand-500/10 text-brand-300' : 'border-dark-600 text-dark-500'}`}>{d}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['technical', 'hr', 'project', 'behavioral'].map(t => (
                <button key={t} onClick={() => toggleType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${form.question_types.includes(t) ? 'bg-brand-500/15 border-brand-500/40 text-brand-300' : 'border-dark-600 text-dark-500'}`}>{t}</button>
              ))}
            </div>
            <select className="input text-sm" value={form.resume_id} onChange={e => setForm(p => ({ ...p, resume_id: e.target.value }))}>
              <option value="">Resume (optional)</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <button onClick={generate} disabled={generating} className="btn-primary w-full justify-center">
              <Sparkles size={15} /> {generating ? 'Generating...' : 'Generate Questions'}
            </button>
          </div>

          {sessions.length > 0 && (
            <div className="glass-card p-4 space-y-1">
              <h4 className="text-xs font-semibold text-dark-400 uppercase mb-2">Past Sessions</h4>
              {sessions.slice(0, 5).map(s => (
                <button key={s.id} onClick={() => setActive(s)} className={`w-full text-left p-2 rounded-lg text-xs ${active?.id === s.id ? 'bg-brand-500/10 text-brand-300' : 'text-dark-400 hover:bg-dark-700/50'}`}>
                  {s.target_role} · {s.questions?.length || 0}q
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {active?.questions?.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold text-dark-100">{active.target_role}</h3><p className="text-xs text-dark-500">{active.questions.length} questions · {active.difficulty}</p></div>
              </div>
              {active.questions.map((q, i) => (
                <div key={q.id} className="glass-card overflow-hidden">
                  <button onClick={() => setOpenQ(openQ === i ? null : i)} className="w-full flex items-start justify-between p-4 text-left hover:bg-dark-700/30">
                    <div className="flex items-start gap-3">
                      <span className="text-dark-600 text-xs font-mono mt-0.5">Q{i+1}</span>
                      <div><p className="text-sm text-dark-100 font-medium">{q.question}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="badge-info">{q.question_type}</span>
                          <span className="badge bg-dark-700 text-dark-400 border-dark-600">{q.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    {openQ === i ? <ChevronUp size={14} className="text-dark-500" /> : <ChevronDown size={14} className="text-dark-500" />}
                  </button>
                  {openQ === i && q.suggested_answer && (
                    <div className="p-4 bg-brand-500/5 border-t border-dark-700">
                      <p className="text-xs font-semibold text-brand-400 mb-2">💡 Suggested Answer</p>
                      <p className="text-sm text-dark-300 leading-relaxed">{q.suggested_answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card h-full min-h-[400px] flex items-center justify-center text-dark-600">
              <div className="text-center"><Brain size={32} className="mx-auto mb-2 opacity-50" /><p>Configure and generate interview questions</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
