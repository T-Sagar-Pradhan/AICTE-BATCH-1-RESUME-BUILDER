import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { subscriptionAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Pricing() {
  const { isAuthenticated } = useAuth()

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionAPI.getPlans().then(r => r.data),
  })

  const planList = plans
    ? Object.entries(plans).map(([id, p]) => ({ id, ...p }))
    : []

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-dark-50 mb-4"
          >
            Simple, transparent pricing
          </motion.h1>
          <p className="text-dark-400 text-lg">Choose the plan that fits your career goals</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {planList.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 flex flex-col relative ${
                plan.id === 'pro' ? 'border-brand-500/50 ring-2 ring-brand-500/20' : ''
              }`}
            >
              {plan.id === 'pro' && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-5">
                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                  plan.id === 'free'    ? 'bg-dark-700' :
                  plan.id === 'pro'     ? 'bg-brand-500/20' : 'bg-amber-500/20'
                }`}>
                  {plan.id === 'free'    ? <Zap size={18} className="text-dark-300" /> :
                   plan.id === 'pro'     ? <Star size={18} className="text-brand-400" /> :
                                           <Crown size={18} className="text-amber-400" />}
                </div>
                <h2 className="text-xl font-bold text-dark-50">{plan.name}</h2>
                <p className="text-dark-500 text-sm mt-0.5">{plan.desc}</p>
              </div>

              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold text-dark-50">
                  ₹{plan.price}
                </span>
                {plan.price > 0 && <span className="text-dark-500 mb-1">/month</span>}
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-dark-300">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={isAuthenticated ? '/settings#subscription' : '/register'}
                className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.id === 'pro'
                    ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25'
                    : 'bg-dark-700 hover:bg-dark-600 text-dark-100 border border-dark-600'
                }`}
              >
                {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name}`}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
