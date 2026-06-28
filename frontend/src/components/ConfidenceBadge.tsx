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
    classes: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/25',
    icon: TrendingUp,
    uk: 'Висока точність',
    en: 'High confidence',
  },
  medium: {
    classes: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/25',
    icon: Minus,
    uk: 'Середня точність',
    en: 'Medium confidence',
  },
  low: {
    classes: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/25',
    icon: TrendingDown,
    uk: 'Низька точність',
    en: 'Low confidence',
  },
} as const

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
}

const iconSizes = { sm: 12, md: 14, lg: 16 }

export function ConfidenceBadge({ confidence, size = 'md', className }: ConfidenceBadgeProps) {
  const { i18n } = useTranslation()
  const cfg = config[confidence]
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
