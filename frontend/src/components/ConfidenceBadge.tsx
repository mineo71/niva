import { TrendingUp, Minus, TrendingDown } from 'lucide-react'
import type { ConfidenceLevel } from '@/types'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const config = {
  high: { classes: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]', icon: TrendingUp },
  medium: { classes: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]', icon: Minus },
  low: { classes: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]', icon: TrendingDown },
} as const

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

const iconSizes = { sm: 11, md: 13, lg: 15 }

export function ConfidenceBadge({ confidence, size = 'md', className }: ConfidenceBadgeProps) {
  const { t } = useTranslation()
  const cfg = config[confidence]
  const Icon = cfg.icon

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-lg border',
        cfg.classes,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} />
      {t(`predict.confidence.${confidence}`)}
    </span>
  )
}
