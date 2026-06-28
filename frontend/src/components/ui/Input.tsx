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
            className="text-xs font-medium text-[#6b9e78] uppercase tracking-wider font-display"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b9e78]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[#0a1410] border border-[#1e3022] rounded-lg text-[#f0f4f1] placeholder-[#3d7050]',
              'h-10 px-3 text-sm font-sans transition-all duration-200 outline-none',
              'hover:border-[#2d4a34]',
              'focus:border-[#4ade80]/60 focus:shadow-[0_0_0_2px_rgba(74,222,128,0.12)]',
              error && 'border-[#ef4444]/50 focus:border-[#ef4444]/70 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.12)]',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b9e78]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[#ef4444] mt-0.5">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6b9e78]">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
