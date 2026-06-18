import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, BarChart3, CheckCircle, AlertTriangle, Target, Search } from 'lucide-react'
import { atsAPI } from '../services/api'
import toast from 'react-hot-toast'
import ScoreRing from '../components/ui/ScoreRing'

function ScoreBar({ label, score }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-dark-400">{label}</span>
        <span className="font-semibold text-dark-200">{Math.round(score)}%</span>
      </div>
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function ATSAnalyzer() {
  const [report, setReport] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [jobDesc, setJobDesc] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [matching, setMatching] = useState(false)

  const onDrop = useCallback(async (files) => {
    if (!files[0]) return
    setAnalyzing(true)
    try {
      const res = await atsAPI.analyze(files[0])
      setReport(res.data)
      toast.success(`ATS Score: ${res.data.overall_score}%`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Analysis failed')
    } finally { setAnalyzing(false) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  })

  const handleMatch = async () => {
    if (!jobDesc) { toast.error('Paste a job description'); return }
    
    // Use extracted text from report, or user's resumes
    let resumeText = ''
    if (report?.extracted_text) {
      resumeText = report.extracted_text
    } else if (report?.detected_skills?.length) {
      resumeText = report.detected_skills.join(' ') + ' ' + (report.sections_found || []).join(' ')
    }
    
    if (!resumeText) { toast.error('Upload a resume first for matching'); return }
    
    setMatching(true)
    try {
      const res = await atsAPI.match({ resume_text: resumeText, job_description: jobDesc })
      setMatchResult(res.data)
      toast.success(`Match: ${res.data.match_score}%`)
    } catch (err) { toast.error(err?.response?.data?.detail || 'Match failed') }
    finally { setMatching(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <BarChart3 size={22} className="text-emerald-400" /> ATS Analyzer
        </h1>
        <p className="text-dark-400 text-sm">Upload your resume PDF to get an ATS compatibility score</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Upload */}
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-dark-600 hover:border-dark-500'}`}>
            <input {...getInputProps()} />
            {analyzing ? (
              <div>
                <div className="w-12 h-12 rounded-full border-4 border-dark-700 border-t-brand-500 animate-spin mx-auto mb-3" />
                <p className="text-dark-300 font-medium">Analyzing resume...</p>
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-dark-400" />
                </div>
                <p className="text-dark-200 font-semibold mb-1">Drop your resume or click to upload</p>
                <p className="text-dark-500 text-sm">PDF format only · Max 10MB</p>
              </div>
            )}
          </div>

          {/* Results */}
          {report && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-6">
                <ScoreRing score={Math.round(report.overall_score)} size={110} label="ATS" />
                <div>
                  <h3 className="font-bold text-dark-100 text-lg">
                    {report.overall_score >= 80 ? '🎉 Excellent!' : report.overall_score >= 60 ? '✅ Good Resume' : '⚠️ Needs Work'}
                  </h3>
                  <p className="text-dark-400 text-sm mt-1">
                    {report.overall_score >= 80 ? 'Highly optimized for ATS.' : 'Follow recommendations below to improve.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-dark-300">Score Breakdown</h4>
                <ScoreBar label="Formatting" score={report.formatting_score} />
                <ScoreBar label="Skills" score={report.skills_score} />
                <ScoreBar label="Keywords" score={report.keyword_score} />
                <ScoreBar label="Readability" score={report.readability_score} />
                <ScoreBar label="Structure" score={report.structure_score} />
              </div>

              {report.detected_skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-dark-300 mb-2">Detected Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {report.detected_skills.map(s => <span key={s} className="badge-info">{s}</span>)}
                  </div>
                </div>
              )}

              {report.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-dark-300 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                        <CheckCircle size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.weak_sections?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-dark-300 mb-2">Issues</h4>
                  <ul className="space-y-1.5">
                    {report.weak_sections.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-dark-400">
                        <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Match */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-dark-100 mb-3 flex items-center gap-2">
              <Target size={16} className="text-brand-400" /> Job Match Engine
            </h3>
            <textarea className="input resize-none text-sm" rows={6} placeholder="Paste job description here..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            <button onClick={handleMatch} disabled={matching || !report} className="btn-primary w-full justify-center mt-3">
              <Search size={14} /> {matching ? 'Matching...' : 'Match Resume'}
            </button>

            {matchResult && (
              <div className="mt-4 p-4 rounded-xl bg-dark-700/50 border border-dark-600 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-dark-200">Match Score</span>
                  <span className={`text-xl font-bold ${matchResult.match_score >= 70 ? 'text-emerald-400' : matchResult.match_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {matchResult.match_score}%
                  </span>
                </div>
                {matchResult.missing_skills?.length > 0 && (
                  <div>
                    <p className="text-xs text-dark-500 mb-1">Missing Skills</p>
                    <div className="flex flex-wrap gap-1">{matchResult.missing_skills.map(s => <span key={s} className="badge-danger">{s}</span>)}</div>
                  </div>
                )}
                {matchResult.suggestions?.length > 0 && (
                  <div>
                    <p className="text-xs text-dark-500 mb-1">Suggestions</p>
                    {matchResult.suggestions.slice(0, 4).map((s, i) => (
                      <p key={i} className="text-xs text-dark-300">→ {s}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
