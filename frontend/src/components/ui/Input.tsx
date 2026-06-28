import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#374151] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-white border border-[#e5e7eb] rounded-lg',
              'text-[#111827] placeholder-[#9ca3af]',
              'h-9 px-3 text-sm font-sans transition-colors duration-150 outline-none',
              'hover:border-[#d1d5db]',
              'focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15',
              error && 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/15',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
