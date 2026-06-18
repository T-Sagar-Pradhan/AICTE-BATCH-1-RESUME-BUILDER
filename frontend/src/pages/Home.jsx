import { Link } from 'react-router-dom'

const features = [
  { title: 'Resume Builder', desc: 'Drag-and-drop builder with professional templates. Live preview and one-click PDF export.', emoji: '📄' },
  { title: 'ATS Analyzer', desc: 'Upload your resume and get a detailed ATS compatibility score with actionable improvements.', emoji: '📊' },
  { title: 'Cover Letter AI', desc: 'Generate personalized, professional cover letters in seconds using AI.', emoji: '✉️' },
  { title: 'Portfolio Generator', desc: 'Auto-generate a stunning portfolio website from your resume. 4 themes. Deploy instantly.', emoji: '🌐' },
  { title: 'Interview Prep', desc: 'AI-generated technical, HR, and project questions tailored to your target role.', emoji: '🧠' },
  { title: 'Career Advisor', desc: 'Chat with an AI career expert for resume advice, career guidance, and interview tips.', emoji: '💬' },
]

const stats = [
  { value: '50K+', label: 'Resumes Created' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: '3x', label: 'More Interviews' },
  { value: '4.9★', label: 'User Rating' },
]

const plans = [
  { name: 'Free', price: '₹0', desc: 'Get started', features: ['3 ATS Analyses', '3 Cover Letters', '2 Templates', 'Basic Dashboard'], cta: 'Start Free', highlight: false },
  { name: 'Pro', price: '₹99', period: '/mo', desc: 'For serious seekers', features: ['Unlimited ATS', 'Unlimited Cover Letters', 'All Templates', 'Portfolio Generator', 'AI Career Advisor', 'Priority Support'], cta: 'Start Pro', highlight: true, badge: 'Most Popular' },
  { name: 'Premium', price: '₹199', period: '/mo', desc: 'Full power', features: ['Everything in Pro', 'Skill Gap Analysis', 'Career Roadmap', 'LinkedIn Import', 'Team Collaboration', '24/7 Support'], cta: 'Go Premium', highlight: false },
]

export default function Home() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#050816' }}>
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.04]" style={{ background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-white">CareerForge <span className="text-brand-400">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-dark-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-dark-400 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-dark-400 hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-dark-300 hover:text-white transition-colors px-3 py-1.5">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-600/20 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
            ✨ Powered by AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Land Your Dream Job<br />
            <span className="gradient-text">10x Faster</span>
          </h1>

          <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            AI-powered resume building, ATS optimization, cover letter generation,
            portfolio creation, and interview preparation — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base py-3.5 px-8 btn-magnetic">
              Start Building Free →
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 text-base py-3.5 px-8 text-dark-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-dark-600 text-sm">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-dark-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to get hired</h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">Six powerful AI tools working together to maximize your job search success.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ title, desc, emoji }) => (
              <div key={title} className="glass-card p-6 hover-lift shine-on-hover group">
                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6" style={{ background: 'rgba(15,23,42,0.3)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Next Generation</h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              CareerForge AI is designed for students and job seekers who want to stand out in today's competitive job market.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <span className="text-4xl block mb-4">🎯</span>
              <h4 className="font-semibold text-white mb-2">ATS-Optimized</h4>
              <p className="text-dark-500 text-sm">Every resume is crafted to pass Applicant Tracking Systems used by 98% of Fortune 500 companies.</p>
            </div>
            <div className="glass-card p-6 text-center">
              <span className="text-4xl block mb-4">⚡</span>
              <h4 className="font-semibold text-white mb-2">AI-Powered</h4>
              <p className="text-dark-500 text-sm">Leveraging cutting-edge AI to generate professional content, analyze compatibility, and provide career guidance.</p>
            </div>
            <div className="glass-card p-6 text-center">
              <span className="text-4xl block mb-4">🚀</span>
              <h4 className="font-semibold text-white mb-2">All-in-One</h4>
              <p className="text-dark-500 text-sm">Resume, cover letter, portfolio, interview prep, and career advisor — everything in a single platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-dark-400 text-lg">Start free, upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative glass-card p-6 flex flex-col hover-lift ${plan.highlight ? 'border-brand-500/40 ring-1 ring-brand-500/20' : ''}`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-brand-600 to-violet-600 text-white text-xs font-semibold rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                  <p className="text-dark-500 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-dark-500 mb-1">{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-dark-300">
                      <span className="text-emerald-400 text-xs">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={plan.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to launch your career?</h2>
          <p className="text-dark-400 text-lg mb-8">Join thousands who use CareerForge AI to get hired faster.</p>
          <Link to="/register" className="btn-primary text-base py-3.5 px-8 btn-magnetic">Get Started — It's Free →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">C</span>
          </div>
          <span className="font-semibold text-dark-400 text-sm">CareerForge AI</span>
        </div>
        <p className="text-dark-700 text-xs">© 2024 CareerForge AI. Built for the next generation of professionals.</p>
      </footer>
    </div>
  )
}
