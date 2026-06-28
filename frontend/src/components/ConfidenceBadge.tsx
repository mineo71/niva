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
  high: {
    classes: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]',
    icon: TrendingUp,
    uk: 'Висока точність',
    en: 'High confidence',
  },
  medium: {
    classes: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]',
    icon: Minus,
    uk: 'Середня точність',
    en: 'Medium confidence',
  },
  low: {
    classes: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
    icon: TrendingDown,
    uk: 'Низька точність',
    en: 'Low confidence',
  },
} as const

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

const iconSizes = { sm: 11, md: 13, lg: 15 }

export function ConfidenceBadge({ confidence, size = 'md', className }: ConfidenceBadgeProps) {
  const { i18n } = useTranslation()
  const cfg = config[confidence]
  const Icon = cfg.icon
  const lang = i18n.language as 'uk' | 'en'

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
      {lang === 'uk' ? cfg.uk : cfg.en}
    </span>
  )
}
