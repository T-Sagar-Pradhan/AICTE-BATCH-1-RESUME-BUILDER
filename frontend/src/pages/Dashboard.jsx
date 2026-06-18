import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAPI } from '../services/api'
import TiltCard from '../components/ui/TiltCard'
import ScoreRing from '../components/ui/ScoreRing'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    dashboardAPI.getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const s = stats?.stats || {}

  const statCards = [
    { label: 'ATS Score', value: s.latest_ats_score ? `${Math.round(s.latest_ats_score)}%` : '—', color: '#10b981', glow: 'rgba(16,185,129,0.15)' },
    { label: 'Resumes', value: s.total_resumes || 0, color: '#818cf8', glow: 'rgba(129,140,248,0.15)' },
    { label: 'Cover Letters', value: s.cover_letters || 0, color: '#c084fc', glow: 'rgba(192,132,252,0.15)' },
    { label: 'AI Credits', value: s.ai_credits || user?.ai_credits || '10', color: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
  ]

  const actions = [
    { label: 'Build Resume', href: '/resume-builder', emoji: '📄', desc: 'Create ATS-optimized resumes' },
    { label: 'ATS Analyzer', href: '/ats-analyzer', emoji: '📊', desc: 'Get your ATS score' },
    { label: 'Cover Letter', href: '/cover-letter', emoji: '✉️', desc: 'AI-generated letters' },
    { label: 'Portfolio', href: '/portfolio', emoji: '🌐', desc: 'Generate portfolio site' },
    { label: 'Interview Prep', href: '/interview-prep', emoji: '🧠', desc: 'Practice questions' },
    { label: 'Career Advisor', href: '/career-advisor', emoji: '💬', desc: 'Chat with AI' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {greeting}, <span className="gradient-text">{user?.fullname?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-dark-400 text-sm mt-2 font-light tracking-wide">Track your progress and take the next step</p>
        </div>
        <Link to="/resume-builder" className="btn-primary btn-magnetic shine-on-hover">+ New Resume</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, color, glow }, i) => (
          <TiltCard key={label} className="stat-card hover-lift shine-on-hover" glowColor={glow}>
            <div className="relative">
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
              <p className="text-[10px] text-dark-500 uppercase tracking-[0.2em] font-semibold mb-4">{label}</p>
              <p className="text-4xl font-bold tracking-tight" style={{ color }}>{value}</p>
              <div className="mt-4 h-[2px] rounded-full overflow-hidden" style={{ background: `${color}10` }}>
                <div className="h-full rounded-full" style={{ width: '65%', background: `linear-gradient(90deg, ${color}, ${color}40)` }} />
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-7 animate-border-glow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg tracking-tight">⚡ Quick Actions</h3>
          <div className="h-px flex-1 mx-6 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map(({ label, href, emoji, desc }) => (
            <Link
              key={label}
              to={href}
              className="group flex flex-col items-center text-center p-5 rounded-2xl border border-white/[0.04] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.04] hover-lift shine-on-hover transition-all duration-300"
            >
              <span className="text-3xl mb-3 group-hover:scale-125 transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]">{emoji}</span>
              <span className="text-xs text-dark-200 font-medium mb-0.5 group-hover:text-white transition-colors">{label}</span>
              <span className="text-[10px] text-dark-600 leading-tight">{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ATS Score Overview (if available) */}
      {s.latest_ats_score && (
        <div className="glass-card p-7">
          <h3 className="text-white font-semibold text-lg tracking-tight mb-6">Latest ATS Analysis</h3>
          <div className="flex items-center gap-8">
            <ScoreRing score={Math.round(s.latest_ats_score)} size={130} label="ATS Score" />
            <div className="flex-1 space-y-3">
              <p className="text-dark-300 text-sm">
                {s.latest_ats_score >= 80 ? '🎉 Excellent! Your resume is well-optimized.' :
                 s.latest_ats_score >= 60 ? '✅ Good score. A few improvements will help.' :
                 '⚠️ Your resume needs optimization. Check the ATS Analyzer for details.'}
              </p>
              <Link to="/ats-analyzer" className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
                View full report →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer status */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
          <span className="text-[11px] text-dark-600 tracking-wide">All systems operational</span>
        </div>
        <span className="text-[11px] text-dark-700 tracking-wider">CAREERFORGE AI v1.0</span>
      </div>
    </div>
  )
}
