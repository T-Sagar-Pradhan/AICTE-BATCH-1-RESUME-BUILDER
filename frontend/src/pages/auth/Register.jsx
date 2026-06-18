import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullname || !email || !password) {
      toast.error('Please fill all fields')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await registerUser(fullname, email, password)
      toast.success('Account created! Welcome to CareerForge AI 🚀')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-dark-50">CareerForge <span className="text-brand-400">AI</span></span>
        </Link>

        <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark-50 mb-1">Create your account</h1>
            <p className="text-dark-400 text-sm">Start your career journey for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="input"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

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
                  placeholder="Min 8 characters, 1 number"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? 'Creating...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-xs text-dark-600 mt-4">
            By creating an account you agree to our Terms of Service
          </p>

          <div className="mt-6 pt-6 border-t border-dark-700 text-center">
            <p className="text-sm text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
