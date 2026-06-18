import { motion } from 'framer-motion'

/**
 * Live resume preview rendered as HTML-styled div.
 * Mirrors the PDF output visually.
 */
export default function ResumePreview({ data = {}, template = 'modern' }) {
  const personal = data.personal_details || {}
  const skills   = data.skills || []
  const exp      = data.experience || []
  const edu      = data.education || []
  const projects = data.projects || []
  const certs    = data.certifications || []

  const styles = {
    modern:      { accent: '#2563eb', header: '#1e293b' },
    ats_friendly:{ accent: '#374151', header: '#111827' },
    minimal:     { accent: '#6b7280', header: '#1f2937' },
    developer:   { accent: '#7c3aed', header: '#1e1b4b' },
    corporate:   { accent: '#059669', header: '#064e3b' },
  }
  const s = styles[template] || styles.modern

  const SectionHeader = ({ title }) => (
    <div style={{ marginTop: 14, marginBottom: 4 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                   letterSpacing: '0.08em', color: s.accent, margin: 0 }}>{title}</h3>
      <hr style={{ border: 'none', borderTop: `1px solid ${s.accent}40`, marginTop: 2 }} />
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl overflow-hidden shadow-2xl"
      style={{
        fontFamily: "'Georgia', serif",
        color: '#1a1a1a',
        fontSize: 10,
        lineHeight: 1.5,
        padding: '28px 32px',
        minHeight: 500,
        maxWidth: 595,
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: s.header, margin: 0, letterSpacing: '-0.5px' }}>
          {personal.name || 'Your Name'}
        </h1>
        <div style={{ marginTop: 4, color: '#475569', fontSize: 9, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {personal.email    && <span>{personal.email}</span>}
          {personal.phone    && <span>·  {personal.phone}</span>}
          {personal.location && <span>·  {personal.location}</span>}
          {personal.linkedin && <span>·  {personal.linkedin}</span>}
          {personal.github   && <span>·  {personal.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {(data.summary || data.ai_summary) && (
        <>
          <SectionHeader title="Professional Summary" />
          <p style={{ color: '#374151', fontSize: 9.5, margin: '4px 0' }}>
            {data.summary || data.ai_summary}
          </p>
        </>
      )}

      {/* Experience */}
      {exp.length > 0 && (
        <>
          <SectionHeader title="Experience" />
          {exp.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 10 }}>{e.position || e.role}</strong>
                <span style={{ color: '#64748b', fontSize: 9 }}>
                  {e.start_date}{e.start_date && (e.end_date || e.is_current) ? ' – ' : ''}{e.is_current ? 'Present' : e.end_date}
                </span>
              </div>
              <div style={{ color: s.accent, fontSize: 9.5, fontWeight: 600 }}>{e.company}</div>
              {Array.isArray(e.description) && e.description.map((d, j) => (
                <div key={j} style={{ color: '#374151', fontSize: 9, marginLeft: 8 }}>• {d}</div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Education */}
      {edu.length > 0 && (
        <>
          <SectionHeader title="Education" />
          {edu.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 10 }}>{e.degree}{e.field ? ` in ${e.field}` : ''}</strong>
                <span style={{ color: '#64748b', fontSize: 9 }}>{e.end_date}</span>
              </div>
              <div style={{ color: '#475569', fontSize: 9.5 }}>{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <SectionHeader title="Skills" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {skills.slice(0, 20).map((sk, i) => {
              const name = typeof sk === 'string' ? sk : sk?.name || String(sk)
              return (
                <span key={i} style={{
                  padding: '2px 8px', borderRadius: 12,
                  background: `${s.accent}15`, color: s.accent,
                  fontSize: 8.5, fontWeight: 600, border: `1px solid ${s.accent}30`
                }}>
                  {name}
                </span>
              )
            })}
          </div>
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <SectionHeader title="Projects" />
          {projects.slice(0, 3).map((p, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: 10 }}>{p.name}</strong>
              {p.technologies?.length > 0 && (
                <span style={{ color: '#64748b', fontSize: 8.5 }}> · {p.technologies.slice(0, 4).join(', ')}</span>
              )}
              {p.description && <div style={{ color: '#374151', fontSize: 9, marginLeft: 8 }}>• {p.description}</div>}
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <>
          <SectionHeader title="Certifications" />
          {certs.map((c, i) => (
            <div key={i} style={{ color: '#374151', fontSize: 9, marginBottom: 2 }}>
              • <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${c.date})` : ''}
            </div>
          ))}
        </>
      )}
    </motion.div>
  )
}
