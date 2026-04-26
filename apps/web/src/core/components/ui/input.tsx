import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  return (
    <div className="field-group">
      {label ? <label htmlFor={id} className="field-label">{label}</label> : null}
      <input ref={ref} id={id} className={cn('app-input', error && 'is-error', className)} {...props} />
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  )
})