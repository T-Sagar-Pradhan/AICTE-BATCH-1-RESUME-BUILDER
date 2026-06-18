import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  outline: `inline-flex items-center gap-2 px-5 py-2.5 border border-brand-500 text-brand-400
            hover:bg-brand-500/10 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]`,
}

const sizes = {
  sm:  'px-3 py-1.5 text-xs',
  md:  '',
  lg:  'px-7 py-3.5 text-base',
  xl:  'px-9 py-4 text-lg',
  icon: 'p-2',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, children, className, disabled, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={clsx(variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </motion.button>
  )
})

export default Button
