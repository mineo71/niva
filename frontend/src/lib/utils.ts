import type { CropType, SoilType } from '@/types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatArea(ha: number, lang = 'en'): string {
  const isUk = lang === 'uk'
  if (isUk) {
    if (ha >= 1000) return `${(ha / 1000).toFixed(1)} тис. га`
    if (ha >= 1) return `${ha.toFixed(1)} га`
    return `${(ha * 10000).toFixed(0)} м²`
  }
  if (ha >= 1000) return `${(ha / 1000).toFixed(1)}k ha`
  if (ha >= 1) return `${ha.toFixed(1)} ha`
  return `${(ha * 10000).toFixed(0)} m²`
}

export function formatDate(iso: string, lang = 'en'): string {
  try {
    return new Intl.DateTimeFormat(lang, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatShortDate(iso: string, lang = 'en'): string {
  try {
    return new Intl.DateTimeFormat(lang, {
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export const ALL_CROPS: CropType[] = [
  'wheat', 'corn', 'sunflower', 'soybeans',
  'barley', 'oats', 'rye', 'rapeseed',
]

export const ALL_SOILS: SoilType[] = ['chalk', 'peat', 'sandy', 'silt']

// ── NDVI staleness helpers ────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function isStale(iso: string | null): boolean {
  if (!iso) return false
  return Date.now() - new Date(iso).getTime() > STALE_THRESHOLD_MS
}

export function formatRelativeTime(iso: string, lang: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)

  try {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
    if (diffMonths >= 1) return rtf.format(-diffMonths, 'month')
    if (diffDays >= 1)   return rtf.format(-diffDays, 'day')
    if (diffHours >= 1)  return rtf.format(-diffHours, 'hour')
    if (diffMin >= 1)    return rtf.format(-diffMin, 'minute')
    return rtf.format(0, 'second')
  } catch {
    // Fallback for unsupported locales
    if (diffMonths >= 1) return `${diffMonths}mo ago`
    if (diffDays >= 1)   return `${diffDays}d ago`
    if (diffHours >= 1)  return `${diffHours}h ago`
    if (diffMin >= 1)    return `${diffMin}m ago`
    return 'just now'
  }
}
