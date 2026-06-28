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

// Crop emoji icons
export const CROP_ICONS: Record<CropType, string> = {
  wheat: '🌾',
  corn: '🌽',
  sunflower: '🌻',
  soybeans: '🫛',
  barley: '🌾',
  oats: '🌾',
  rye: '🌾',
  rapeseed: '🌼',
}

export const ALL_CROPS: CropType[] = [
  'wheat', 'corn', 'sunflower', 'soybeans',
  'barley', 'oats', 'rye', 'rapeseed',
]

export const ALL_SOILS: SoilType[] = ['chalk', 'peat', 'sandy', 'silt']
