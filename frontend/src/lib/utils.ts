import type { CropType, SoilType } from '@/types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatArea(ha: number): string {
  if (ha >= 1000) return `${(ha / 1000).toFixed(1)} тис. га`
  if (ha >= 1) return `${ha.toFixed(1)} га`
  return `${(ha * 10000).toFixed(0)} м²`
}

export function formatAreaEn(ha: number): string {
  if (ha >= 1000) return `${(ha / 1000).toFixed(1)}k ha`
  return `${ha.toFixed(1)} ha`
}

export function formatDate(iso: string, lang = 'uk'): string {
  try {
    return new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatShortDate(iso: string, lang = 'uk'): string {
  try {
    return new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// Ukrainian crop labels
export const CROP_LABELS_UK: Record<CropType, string> = {
  wheat: 'Пшениця',
  corn: 'Кукурудза',
  sunflower: 'Соняшник',
  soybeans: 'Соя',
  barley: 'Ячмінь',
  oats: 'Овес',
  rye: 'Жито',
  rapeseed: 'Ріпак',
}

export const CROP_LABELS_EN: Record<CropType, string> = {
  wheat: 'Wheat',
  corn: 'Corn',
  sunflower: 'Sunflower',
  soybeans: 'Soybeans',
  barley: 'Barley',
  oats: 'Oats',
  rye: 'Rye',
  rapeseed: 'Rapeseed',
}

export const SOIL_LABELS_UK: Record<SoilType, string> = {
  chalk: 'Крейдовий',
  peat: 'Торфовий',
  sandy: 'Піщаний',
  silt: 'Мулистий',
}

export const SOIL_LABELS_EN: Record<SoilType, string> = {
  chalk: 'Chalk',
  peat: 'Peat',
  sandy: 'Sandy',
  silt: 'Silt',
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

export function formatRelativeTime(iso: string, lang: 'uk' | 'en'): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)

  if (lang === 'uk') {
    if (diffMonths >= 1) return `${diffMonths} міс тому`
    if (diffDays >= 1)   return `${diffDays} дн тому`
    if (diffHours >= 1)  return `${diffHours} год тому`
    if (diffMin >= 1)    return `${diffMin} хв тому`
    return 'щойно'
  } else {
    if (diffMonths >= 1) return `${diffMonths}mo ago`
    if (diffDays >= 1)   return `${diffDays}d ago`
    if (diffHours >= 1)  return `${diffHours}h ago`
    if (diffMin >= 1)    return `${diffMin}m ago`
    return 'just now'
  }
}
