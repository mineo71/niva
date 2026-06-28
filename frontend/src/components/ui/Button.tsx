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
    'bg-[#4ade80] text-[#040a06] font-semibold hover:bg-[#22c55e] active:bg-[#16a34a] shadow-[0_0_20px_rgba(74,222,128,0.25)] hover:shadow-[0_0_28px_rgba(74,222,128,0.4)]',
  secondary:
    'bg-[#112018] text-[#4ade80] border border-[#2d4a34] hover:bg-[#16301f] hover:border-[#4ade80]/40',
  ghost:
    'text-[#6b9e78] hover:text-[#f0f4f1] hover:bg-[#112018]',
  danger:
    'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/20',
  outline:
    'border border-[#2d4a34] text-[#f0f4f1] hover:bg-[#112018] hover:border-[#4ade80]/40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-sans transition-all duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[#4ade80]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
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
