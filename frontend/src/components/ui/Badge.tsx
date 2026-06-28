import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20',
  success:  'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20',
  warning:  'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  danger:   'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
  info:     'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20',
  neutral:  'bg-[#6b9e78]/10 text-[#6b9e78] border-[#6b9e78]/20',
}

const dotClasses: Record<BadgeVariant, string> = {
  default:  'bg-[#4ade80]',
  success:  'bg-[#4ade80]',
  warning:  'bg-[#f59e0b]',
  danger:   'bg-[#ef4444]',
  info:     'bg-[#60a5fa]',
  neutral:  'bg-[#6b9e78]',
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md border font-sans',
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClasses[variant])} />}
      {children}
    </span>
  )
}
