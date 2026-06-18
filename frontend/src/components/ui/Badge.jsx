import { clsx } from 'clsx'

const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  purple:  'badge-purple',
  default: 'badge bg-dark-700 text-dark-400 border-dark-600',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx(variants[variant], className)}>
      {children}
    </span>
  )
}
