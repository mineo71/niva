import { Leaf, AlertTriangle, XCircle } from 'lucide-react'
import type { HealthLevel } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface HealthBadgeProps {
  health: HealthLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const config = {
  good: {
    classes: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/25',
    icon: Leaf,
    uk: 'Добрий',
    en: 'Good',
  },
  moderate: {
    classes: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/25',
    icon: AlertTriangle,
    uk: 'Помірний',
    en: 'Moderate',
  },
  poor: {
    classes: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/25',
    icon: XCircle,
    uk: 'Поганий',
    en: 'Poor',
  },
} as const

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
}

const iconSizes = { sm: 12, md: 14, lg: 16 }

export function HealthBadge({ health, size = 'md', className }: HealthBadgeProps) {
  const { i18n } = useTranslation()
  const cfg = config[health]
  const Icon = cfg.icon
  const lang = i18n.language as 'uk' | 'en'

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-lg border font-sans',
        cfg.classes,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} />
      {lang === 'uk' ? cfg.uk : cfg.en}
    </span>
  )
}
