import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#16a34a] text-white font-semibold hover:bg-[#15803d] active:bg-[#166534] shadow-sm',
  secondary:
    'bg-white text-[#16a34a] border border-[#bbf7d0] hover:bg-[#f0fdf4] hover:border-[#16a34a]/40',
  ghost:
    'text-[#6b7280] hover:text-[#111827] hover:bg-[#f9fafb]',
  danger:
    'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] hover:bg-[#fee2e2]',
  outline:
    'bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium font-sans',
          'transition-colors duration-150 outline-none cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-[#16a34a]/40 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
