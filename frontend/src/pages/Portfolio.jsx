import { useState, useEffect } from 'react'
import { Globe, Download, Eye, Trash2, Plus, X } from 'lucide-react'
import { portfolioAPI, resumesAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([])
  const [resumes, setResumes] = useState([])
  const [generating, setGenerating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [showForm, setShowForm] = useState(true)

  const [form, setForm] = useState({
    theme: 'dark',
    resume_id: '',
    github_url: '',
    linkedin_url: '',
    tagline: '',
    about: '',
    skills: '',
    projects: [{ name: '', description: '', technologies: '', github_url: '', live_url: '' }],
    experience: [{ company: '', position: '', start_date: '', end_date: '', description: '' }],
  })

  useEffect(() => {
    portfolioAPI.list().then(r => setPortfolios(r.data)).catch(() => {})
    resumesAPI.list().then(r => setResumes(r.data)).catch(() => {})
  }, [])

  const updateProject = (i, key, val) => {
    setForm(p => {
      const projects = [...p.projects]
      projects[i] = { ...projects[i], [key]: val }
      return { ...p, projects }
    })
  }

  const updateExp = (i, key, val) => {
    setForm(p => {
      const experience = [...p.experience]
      experience[i] = { ...experience[i], [key]: val }
      return { ...p, experience }
    })
  }

  const addProject = () => setForm(p => ({ ...p, projects: [...p.projects, { name: '', description: '', technologies: '', github_url: '', live_url: '' }] }))
  const removeProject = (i) => setForm(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }))
  const addExp = () => setForm(p => ({ ...p, experience: [...p.experience, { company: '', position: '', start_date: '', end_date: '', description: '' }] }))
  const removeExp = (i) => setForm(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }))

  const generate = async () => {
    setGenerating(true)
    try {
      // Send portfolio data to backend
      const payload = {
        theme: form.theme,
        resume_id: form.resume_id || undefined,
        github_url: form.github_url,
        linkedin_url: form.linkedin_url,
      }
      const res = await portfolioAPI.generate(payload)
      
      // Now update the portfolio with detailed content
      if (res.data?.id) {
        const updatePayload = {
          tagline: form.tagline,
          about: form.about,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          projects: form.projects.filter(p => p.name).map(p => ({
            ...p,
            technologies: p.technologies.split(',').map(t => t.trim()).filter(Boolean)
          })),
          experience: form.experience.filter(e => e.company),
          github_url: form.github_url,
          linkedin_url: form.linkedin_url,
        }
        await portfolioAPI.update(res.data.id, updatePayload)
      }
      
      const list = await portfolioAPI.list()
      setPortfolios(list.data)
      setShowForm(false)
      toast.success('Portfolio generated!')
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to generate') }
    finally { setGenerating(false) }
  }

  const preview = async (id) => {
    try { const res = await portfolioAPI.preview(id); setPreviewHtml(res.data) }
    catch { toast.error('Preview failed') }
  }

  const download = async (id, slug) => {
    try {
      const res = await portfolioAPI.download(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }))
      const a = document.createElement('a'); a.href = url; a.download = `portfolio-${slug || 'site'}.zip`; a.click()
      URL.revokeObjectURL(url); toast.success('ZIP downloaded!')
    } catch { toast.error('Download failed') }
  }

  const deleteP = async (id) => {
    try { await portfolioAPI.delete(id); setPortfolios(p => p.filter(x => x.id !== id)); toast.success('Deleted') } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe size={22} className="text-orange-400" /> Portfolio Generator</h1>
          <p className="text-dark-400 text-sm">Create a stunning portfolio website with your details</p>
        </div>
        {!showForm && portfolios.length > 0 && (
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={15} /> New Portfolio</button>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        {showForm && (
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-card p-6 space-y-5">
              <h3 className="text-white font-semibold">Portfolio Details</h3>

              {/* Theme & Resume */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['dark', 'light', 'cyberpunk', 'professional'].map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, theme: t }))}
                        className={`p-2.5 rounded-xl border text-xs font-medium capitalize transition-all ${form.theme === t ? 'bg-brand-500/10 border-brand-500/40 text-brand-300' : 'border-white/[0.06] text-dark-500 hover:border-white/[0.1]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Import from Resume (optional)</label>
                  <select className="input" value={form.resume_id} onChange={e => setForm(p => ({ ...p, resume_id: e.target.value }))}>
                    <option value="">Manual input</option>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
              </div>

              {/* Tagline & About */}
              <div>
                <label className="label">Tagline</label>
                <input className="input" placeholder="Full Stack Developer | Building the future" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} />
              </div>
              <div>
                <label className="label">About</label>
                <textarea className="input resize-none" rows={3} placeholder="Brief intro about yourself..." value={form.about} onChange={e => setForm(p => ({ ...p, about: e.target.value }))} />
              </div>

              {/* Skills */}
              <div>
                <label className="label">Skills (comma separated)</label>
                <input className="input" placeholder="React, Python, Docker, AWS, TypeScript..." value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
              </div>

              {/* Links */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">GitHub URL</label>
                  <input className="input" placeholder="https://github.com/username" value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} />
                </div>
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input className="input" placeholder="https://linkedin.com/in/username" value={form.linkedin_url} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} />
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Projects</label>
                  <button onClick={addProject} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"><Plus size={12} /> Add</button>
                </div>
                <div className="space-y-3">
                  {form.projects.map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-dark-500">Project {i + 1}</span>
                        {form.projects.length > 1 && <button onClick={() => removeProject(i)} className="text-red-400 hover:text-red-300"><X size={14} /></button>}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input className="input" placeholder="Project Name" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} />
                        <input className="input" placeholder="Technologies (comma sep)" value={proj.technologies} onChange={e => updateProject(i, 'technologies', e.target.value)} />
                        <input className="input" placeholder="GitHub URL" value={proj.github_url} onChange={e => updateProject(i, 'github_url', e.target.value)} />
                        <input className="input" placeholder="Live URL" value={proj.live_url} onChange={e => updateProject(i, 'live_url', e.target.value)} />
                      </div>
                      <textarea className="input resize-none text-sm" rows={2} placeholder="Brief description..." value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Experience</label>
                  <button onClick={addExp} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"><Plus size={12} /> Add</button>
                </div>
                <div className="space-y-3">
                  {form.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-dark-500">Experience {i + 1}</span>
                        {form.experience.length > 1 && <button onClick={() => removeExp(i)} className="text-red-400 hover:text-red-300"><X size={14} /></button>}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input className="input" placeholder="Company" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} />
                        <input className="input" placeholder="Position" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} />
                        <input className="input" placeholder="Start Date" value={exp.start_date} onChange={e => updateExp(i, 'start_date', e.target.value)} />
                        <input className="input" placeholder="End Date" value={exp.end_date} onChange={e => updateExp(i, 'end_date', e.target.value)} />
                      </div>
                      <textarea className="input resize-none text-sm" rows={2} placeholder="Description..." value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button onClick={generate} disabled={generating} className="btn-primary w-full justify-center py-3">
                <Globe size={16} /> {generating ? 'Generating...' : 'Generate Portfolio Website'}
              </button>
            </div>
          </div>
        )}

        {/* Portfolio List */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-5'}>
          {portfolios.length > 0 ? (
            <div className={`grid ${showForm ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
              {portfolios.map(p => (
                <div key={p.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                      <p className="text-xs text-dark-500 capitalize">{p.theme} theme</p>
                    </div>
                    <span className={`badge ${p.is_published ? 'badge-success' : 'bg-dark-700 text-dark-500 border border-dark-600'}`}>
                      {p.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  {p.tagline && <p className="text-xs text-dark-400 italic">"{p.tagline}"</p>}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => preview(p.id)} className="btn-ghost text-xs"><Eye size={13} /> Preview</button>
                    <button onClick={() => download(p.id, p.slug)} className="btn-ghost text-xs"><Download size={13} /> ZIP</button>
                    <button onClick={() => deleteP(p.id)} className="ml-auto p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <div className="glass-card h-64 flex items-center justify-center text-dark-600">
              <div className="text-center">
                <Globe size={32} className="mx-auto mb-2 opacity-50" />
                <p>No portfolios yet</p>
                <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-xs">Create Portfolio</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]" style={{ background: 'rgba(5,8,22,0.9)' }}>
            <span className="text-sm font-semibold text-white">Portfolio Preview</span>
            <button onClick={() => setPreviewHtml('')} className="btn-secondary text-xs py-1.5 px-3">Close</button>
          </div>
          <iframe srcDoc={previewHtml} className="flex-1 w-full" title="Preview" sandbox="allow-same-origin" />
        </div>
      )}
    </div>
  )
}
