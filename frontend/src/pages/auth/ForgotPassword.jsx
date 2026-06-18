import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({ email: z.string().email('Invalid email') })

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }) => {
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-dark-50">CareerForge <span className="text-brand-400">AI</span></span>
        </Link>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-dark-50 mb-2">Check your email</h2>
              <p className="text-dark-400 text-sm mb-6">
                If that email is registered, you'll receive a password reset link shortly.
              </p>
              <Link to="/login" className="btn-primary inline-flex">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-dark-50 mb-1">Reset password</h1>
                <p className="text-dark-400 text-sm">Enter your email and we'll send a reset link</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={16} />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" loading={isSubmitting} className="w-full justify-center">
                  Send Reset Link
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1 justify-center transition-colors">
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
