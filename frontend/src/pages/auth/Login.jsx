import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[45%] bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 border-r border-dark-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-600/15 rounded-full blur-3xl" />

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-dark-50">CareerForge <span className="text-brand-400">AI</span></span>
        </Link>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          <h2 className="text-3xl font-bold text-dark-50 mb-3">
            Your career,<br />
            <span className="gradient-text">supercharged.</span>
          </h2>
          <p className="text-dark-400 mb-8">
            AI-powered tools to help you build better resumes, ace interviews, and land your dream job.
          </p>
          {[
            'ATS-optimized resumes in minutes',
            'AI-generated cover letters',
            'Interview preparation with AI',
            'Auto-generated portfolio website',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-400 text-xs">→</span>
              </div>
              <span className="text-dark-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-dark-50">CareerForge AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark-50 mb-1">Welcome back</h1>
            <p className="text-dark-400 text-sm">Sign in to continue to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 text-sm"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center text-xs text-dark-600">
              <span className="px-3 bg-dark-900">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-dark-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
