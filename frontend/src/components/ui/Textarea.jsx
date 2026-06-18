import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Textarea = forwardRef(function Textarea(
  { label, error, hint, rows = 4, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'input resize-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-dark-500">{hint}</p>}
    </div>
  )
})

export default Textarea
