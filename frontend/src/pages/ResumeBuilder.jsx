import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, Download, Save, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { resumesAPI } from '../services/api'
import toast from 'react-hot-toast'

const TEMPLATES = [
  { id: 'modern', label: 'Modern' },
  { id: 'ats_friendly', label: 'ATS Friendly' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'developer', label: 'Developer' },
]

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-700/30 transition-colors">
        <span className="font-semibold text-dark-100 text-sm">{title}</span>
        {open ? <ChevronUp size={16} className="text-dark-500" /> : <ChevronDown size={16} className="text-dark-500" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-dark-700 pt-4">{children}</div>}
    </div>
  )
}

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState([])
  const [selected, setSelected] = useState(null)
  const [template, setTemplate] = useState('modern')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: 'My Resume',
    personal_details: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    summary: '',
    skills_text: '',
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  })

  useEffect(() => {
    resumesAPI.list().then(res => setResumes(res.data)).catch(() => {})
  }, [])

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const updatePersonal = (field, value) => setForm(prev => ({
    ...prev, personal_details: { ...prev.personal_details, [field]: value }
  }))

  const loadResume = (r) => {
    setSelected(r)
    setTemplate(r.template || 'modern')
    setForm({
      title: r.title || 'My Resume',
      personal_details: r.personal_details || {},
      summary: r.summary || '',
      skills_text: Array.isArray(r.skills) ? r.skills.join(', ') : '',
      education: r.education || [],
      experience: r.experience || [],
      projects: r.projects || [],
      certifications: r.certifications || [],
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...form,
      template,
      skills: form.skills_text.split(/[,\n]/).map(s => s.trim()).filter(Boolean),
    }
    delete payload.skills_text
    try {
      if (selected) {
        const res = await resumesAPI.update(selected.id, payload)
        setSelected(res.data)
        toast.success('Resume saved!')
      } else {
        const res = await resumesAPI.create(payload)
        setSelected(res.data)
        toast.success('Resume created!')
      }
      const list = await resumesAPI.list()
      setResumes(list.data)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDownload = async () => {
    if (!selected) { toast.error('Save resume first'); return }
    setDownloading(true)
    try {
      const res = await resumesAPI.download(selected.id, template)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `${form.title || 'resume'}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch { toast.error('Download failed') }
    finally { setDownloading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await resumesAPI.delete(id)
      setResumes(prev => prev.filter(r => r.id !== id))
      if (selected?.id === id) { setSelected(null); setForm({ title: 'My Resume', personal_details: {}, summary: '', skills_text: '', education: [], experience: [], projects: [], certifications: [] }) }
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const addItem = (field) => {
    const defaults = {
      education: { institution: '', degree: '', field: '', end_date: '', gpa: '' },
      experience: { company: '', position: '', start_date: '', end_date: '', location: '', description_text: '' },
      projects: { name: '', description: '', tech_string: '', github_url: '' },
      certifications: { name: '', issuer: '', date: '' },
    }
    setForm(prev => ({ ...prev, [field]: [...prev[field], defaults[field]] }))
  }

  const updateItem = (field, index, key, value) => {
    setForm(prev => {
      const arr = [...prev[field]]
      arr[index] = { ...arr[index], [key]: value }
      return { ...prev, [field]: arr }
    })
  }

  const removeItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
            <FileText size={22} className="text-brand-400" /> Resume Builder
          </h1>
          <p className="text-dark-400 text-sm">Build ATS-optimized resumes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
          {selected && (
            <button onClick={handleDownload} disabled={downloading} className="btn-secondary">
              <Download size={15} /> {downloading ? '...' : 'PDF'}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar - Resume list */}
        <div className="space-y-3">
          <button
            onClick={() => { setSelected(null); setForm({ title: 'My Resume', personal_details: {}, summary: '', skills_text: '', education: [], experience: [], projects: [], certifications: [] }) }}
            className="w-full btn-secondary justify-center text-xs"
          >
            <Plus size={14} /> New Resume
          </button>
          {resumes.map(r => (
            <div key={r.id} className={`flex items-center gap-1 p-3 rounded-xl border cursor-pointer transition-colors ${selected?.id === r.id ? 'bg-brand-500/10 border-brand-500/30' : 'border-dark-700 hover:border-dark-600'}`}>
              <button onClick={() => loadResume(r)} className="flex-1 text-left">
                <p className="text-sm font-medium text-dark-200 truncate">{r.title}</p>
                <p className="text-xs text-dark-600">{r.template}</p>
              </button>
              <button onClick={() => handleDelete(r.id)} className="p-1 text-dark-600 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Template */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Template</p>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${template === t.id ? 'bg-brand-500/15 border-brand-500/40 text-brand-300' : 'border-dark-600 text-dark-500 hover:border-dark-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="glass-card p-4">
            <label className="label">Resume Title</label>
            <input className="input" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="My Resume" />
          </div>

          {/* Personal */}
          <Section title="Personal Details">
            <div className="grid sm:grid-cols-2 gap-3">
              {[['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn'],['github','GitHub']].map(([key, label]) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input className="input" placeholder={label} value={form.personal_details[key] || ''} onChange={e => updatePersonal(key, e.target.value)} />
                </div>
              ))}
            </div>
          </Section>

          {/* Summary */}
          <Section title="Professional Summary">
            <textarea className="input resize-none" rows={4} placeholder="A compelling summary..." value={form.summary} onChange={e => updateForm('summary', e.target.value)} />
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <textarea className="input resize-none" rows={3} placeholder="Python, React, Docker, AWS..." value={form.skills_text} onChange={e => updateForm('skills_text', e.target.value)} />
            <p className="text-xs text-dark-600">Separate with commas</p>
          </Section>

          {/* Experience */}
          <Section title="Experience">
            {form.experience.map((exp, i) => (
              <div key={i} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600 space-y-3">
                <div className="flex justify-between"><span className="text-xs text-dark-500">Experience {i+1}</span><button onClick={() => removeItem('experience', i)} className="text-red-400 text-xs">Remove</button></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="input" placeholder="Company" value={exp.company || ''} onChange={e => updateItem('experience', i, 'company', e.target.value)} />
                  <input className="input" placeholder="Position" value={exp.position || ''} onChange={e => updateItem('experience', i, 'position', e.target.value)} />
                  <input className="input" placeholder="Start Date" value={exp.start_date || ''} onChange={e => updateItem('experience', i, 'start_date', e.target.value)} />
                  <input className="input" placeholder="End Date" value={exp.end_date || ''} onChange={e => updateItem('experience', i, 'end_date', e.target.value)} />
                </div>
                <textarea className="input resize-none text-sm" rows={3} placeholder="• Developed...&#10;• Improved..." value={exp.description_text || ''} onChange={e => updateItem('experience', i, 'description_text', e.target.value)} />
              </div>
            ))}
            <button onClick={() => addItem('experience')} className="btn-ghost text-xs"><Plus size={14} /> Add Experience</button>
          </Section>

          {/* Education */}
          <Section title="Education">
            {form.education.map((edu, i) => (
              <div key={i} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600 space-y-3">
                <div className="flex justify-between"><span className="text-xs text-dark-500">Education {i+1}</span><button onClick={() => removeItem('education', i)} className="text-red-400 text-xs">Remove</button></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="input" placeholder="Institution" value={edu.institution || ''} onChange={e => updateItem('education', i, 'institution', e.target.value)} />
                  <input className="input" placeholder="Degree" value={edu.degree || ''} onChange={e => updateItem('education', i, 'degree', e.target.value)} />
                  <input className="input" placeholder="Field" value={edu.field || ''} onChange={e => updateItem('education', i, 'field', e.target.value)} />
                  <input className="input" placeholder="Year" value={edu.end_date || ''} onChange={e => updateItem('education', i, 'end_date', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('education')} className="btn-ghost text-xs"><Plus size={14} /> Add Education</button>
          </Section>

          {/* Projects */}
          <Section title="Projects">
            {form.projects.map((proj, i) => (
              <div key={i} className="p-4 bg-dark-700/30 rounded-xl border border-dark-600 space-y-3">
                <div className="flex justify-between"><span className="text-xs text-dark-500">Project {i+1}</span><button onClick={() => removeItem('projects', i)} className="text-red-400 text-xs">Remove</button></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="input" placeholder="Project Name" value={proj.name || ''} onChange={e => updateItem('projects', i, 'name', e.target.value)} />
                  <input className="input" placeholder="Technologies" value={proj.tech_string || ''} onChange={e => updateItem('projects', i, 'tech_string', e.target.value)} />
                </div>
                <textarea className="input resize-none text-sm" rows={2} placeholder="Description..." value={proj.description || ''} onChange={e => updateItem('projects', i, 'description', e.target.value)} />
              </div>
            ))}
            <button onClick={() => addItem('projects')} className="btn-ghost text-xs"><Plus size={14} /> Add Project</button>
          </Section>

          {/* Certifications */}
          <Section title="Certifications" defaultOpen={false}>
            {form.certifications.map((cert, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className="input flex-1" placeholder="Name" value={cert.name || ''} onChange={e => updateItem('certifications', i, 'name', e.target.value)} />
                <input className="input flex-1" placeholder="Issuer" value={cert.issuer || ''} onChange={e => updateItem('certifications', i, 'issuer', e.target.value)} />
                <button onClick={() => removeItem('certifications', i)} className="text-red-400 p-2"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => addItem('certifications')} className="btn-ghost text-xs"><Plus size={14} /> Add Certification</button>
          </Section>
        </div>
      </div>
    </div>
  )
}
