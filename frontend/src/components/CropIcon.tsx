import { Wheat, Sprout, Sun, Bean, Flower2, type LucideProps } from 'lucide-react'
import type { CropType } from '@/types'

// crop → lucide icon. cereals share Wheat; others get a distinct glyph.
const CROP_ICON_MAP: Record<CropType, React.ComponentType<LucideProps>> = {
  wheat: Wheat,
  barley: Wheat,
  oats: Wheat,
  rye: Wheat,
  corn: Sprout,
  sunflower: Sun,
  soybeans: Bean,
  rapeseed: Flower2,
}

interface CropIconProps {
  crop: CropType
  size?: number
  className?: string
}

export function CropIcon({ crop, size = 16, className }: CropIconProps) {
  const Icon = CROP_ICON_MAP[crop] ?? Sprout
  return <Icon size={size} className={className} aria-hidden="true" />
}
