import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]',
  success:  'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]',
  warning:  'bg-[#fffbeb] text-[#d97706] border-[#fde68a]',
  danger:   'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
  info:     'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]',
  neutral:  'bg-[#f9fafb] text-[#6b7280] border-[#e5e7eb]',
}

const dotClasses: Record<BadgeVariant, string> = {
  default:  'bg-[#16a34a]',
  success:  'bg-[#16a34a]',
  warning:  'bg-[#d97706]',
  danger:   'bg-[#dc2626]',
  info:     'bg-[#2563eb]',
  neutral:  'bg-[#9ca3af]',
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md border',
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClasses[variant])} />}
      {children}
    </span>
  )
}
