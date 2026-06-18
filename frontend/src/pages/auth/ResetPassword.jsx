import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

const schema = z.object({
  new_password: z.string().min(8, 'Min 8 characters').regex(/\d/, 'Must contain a number'),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

export default function ResetPassword() {
  const [showPass, setShowPass] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ new_password }) => {
    if (!token) { toast.error('Invalid reset link'); return }
    try {
      await authAPI.resetPassword({ token, new_password })
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed. Link may be expired.')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-dark-50">CareerForge <span className="text-brand-400">AI</span></span>
        </Link>
        <div className="glass-card p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-dark-50 mb-1">Set new password</h1>
            <p className="text-dark-400 text-sm">Choose a strong password for your account</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.new_password ? 'border-red-500' : ''}`}
                  placeholder="Min 8 chars, 1 number"
                  {...register('new_password')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.new_password && <p className="mt-1.5 text-xs text-red-400">{errors.new_password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className={`input ${errors.confirm ? 'border-red-500' : ''}`}
                placeholder="Repeat password"
                {...register('confirm')}
              />
              {errors.confirm && <p className="mt-1.5 text-xs text-red-400">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full justify-center">
              Reset Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
