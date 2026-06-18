import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(function Input(
  { label, error, hint, icon, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'input',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-dark-500">{hint}</p>}
    </div>
  )
})

export default Input
