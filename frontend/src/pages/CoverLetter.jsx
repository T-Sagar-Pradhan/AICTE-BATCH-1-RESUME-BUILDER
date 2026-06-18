import { useState, useEffect } from 'react'
import { Briefcase, Download, Trash2, Sparkles, Copy, Check } from 'lucide-react'
import { coverLetterAPI, resumesAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CoverLetter() {
  const [form, setForm] = useState({ company_name: '', job_title: '', job_description: '', tone: 'professional', resume_id: '' })
  const [letters, setLetters] = useState([])
  const [resumes, setResumes] = useState([])
  const [selected, setSelected] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    coverLetterAPI.list().then(r => setLetters(r.data)).catch(() => {})
    resumesAPI.list().then(r => setResumes(r.data)).catch(() => {})
  }, [])

  const generate = async () => {
    if (!form.company_name || !form.job_title || !form.job_description) { toast.error('Fill all fields'); return }
    setGenerating(true)
    try {
      const res = await coverLetterAPI.generate(form)
      setSelected(res.data)
      setLetters(prev => [res.data, ...prev])
      toast.success('Cover letter generated!')
    } catch (err) { toast.error(err?.response?.data?.detail || 'Generation failed. Add GEMINI_API_KEY to backend .env') }
    finally { setGenerating(false) }
  }

  const copy = () => { if (selected?.content) { navigator.clipboard.writeText(selected.content); setCopied(true); setTimeout(() => setCopied(false), 2000) } }

  const download = async (id) => {
    try {
      const res = await coverLetterAPI.download(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = 'cover-letter.pdf'; a.click()
      URL.revokeObjectURL(url); toast.success('Downloaded!')
    } catch { toast.error('Download failed') }
  }

  const deleteLetter = async (id) => {
    try { await coverLetterAPI.delete(id); setLetters(prev => prev.filter(l => l.id !== id)); if (selected?.id === id) setSelected(null); toast.success('Deleted') } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2"><Briefcase size={22} className="text-violet-400" /> Cover Letter Generator</h1>
        <p className="text-dark-400 text-sm">Generate personalized cover letters with AI</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <select className="input" value={form.resume_id} onChange={e => setForm(p => ({ ...p, resume_id: e.target.value }))}>
              <option value="">Select resume (optional)</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <input className="input" placeholder="Company Name" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
            <input className="input" placeholder="Job Title" value={form.job_title} onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))} />
            <div className="flex gap-2">
              {['professional', 'formal', 'friendly'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, tone: t }))} className={`flex-1 py-2 rounded-xl text-xs font-medium border capitalize ${form.tone === t ? 'bg-brand-500/15 border-brand-500/40 text-brand-300' : 'border-dark-600 text-dark-500'}`}>{t}</button>
              ))}
            </div>
            <textarea className="input resize-none" rows={6} placeholder="Paste job description..." value={form.job_description} onChange={e => setForm(p => ({ ...p, job_description: e.target.value }))} />
            <button onClick={generate} disabled={generating} className="btn-primary w-full justify-center">
              <Sparkles size={15} /> {generating ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>

          {letters.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <h4 className="text-sm font-semibold text-dark-300">Previous</h4>
              {letters.slice(0, 5).map(l => (
                <button key={l.id} onClick={() => setSelected(l)} className={`w-full text-left p-2 rounded-lg text-sm ${selected?.id === l.id ? 'bg-brand-500/10 text-brand-300' : 'text-dark-400 hover:bg-dark-700/50'}`}>
                  {l.company_name} - {l.job_title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="font-semibold text-dark-100">{selected.title}</h3><p className="text-xs text-dark-500">{selected.tone} tone</p></div>
                <div className="flex gap-2">
                  <button onClick={copy} className="btn-ghost text-xs">{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button>
                  <button onClick={() => download(selected.id)} className="btn-ghost text-xs"><Download size={14} /> PDF</button>
                  <button onClick={() => deleteLetter(selected.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-5 bg-dark-900/50 rounded-xl border border-dark-700 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-dark-200 font-sans leading-relaxed">{selected.content}</pre>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full min-h-[300px] flex items-center justify-center">
              <div className="text-center text-dark-600"><Briefcase size={32} className="mx-auto mb-2 opacity-50" /><p>Generate a cover letter to see it here</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
