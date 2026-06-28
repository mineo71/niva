/**
 * NDVI Color Scale helpers
 * Maps NDVI values (-1 to 1) to a color gradient:
 * -1.0 → 0.0  →  brown/red (bare/water)
 *  0.0 → 0.3  →  yellow (sparse)
 *  0.3 → 0.6  →  light green (moderate)
 *  0.6 → 1.0  →  deep green (dense/healthy)
 */

interface RGB {
  r: number
  g: number
  b: number
}

const STOPS: Array<{ value: number; color: RGB }> = [
  { value: -1.0, color: { r: 100, g: 40,  b: 20  } }, // deep brown (water/bare)
  { value: -0.2, color: { r: 160, g: 80,  b: 40  } }, // medium brown
  { value:  0.0, color: { r: 210, g: 140, b: 60  } }, // amber/tan
  { value:  0.2, color: { r: 220, g: 200, b: 80  } }, // yellow
  { value:  0.35,color: { r: 160, g: 210, b: 100 } }, // yellow-green
  { value:  0.5, color: { r: 90,  g: 185, b: 80  } }, // medium green
  { value:  0.7, color: { r: 40,  g: 150, b: 60  } }, // healthy green
  { value:  1.0, color: { r: 10,  g: 100, b: 40  } }, // deep green
]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function ndviToRgb(value: number): RGB {
  const clamped = Math.max(-1, Math.min(1, value))

  for (let i = 0; i < STOPS.length - 1; i++) {
    const lo = STOPS[i]
    const hi = STOPS[i + 1]
    if (clamped >= lo.value && clamped <= hi.value) {
      const t = (clamped - lo.value) / (hi.value - lo.value)
      return {
        r: Math.round(lerp(lo.color.r, hi.color.r, t)),
        g: Math.round(lerp(lo.color.g, hi.color.g, t)),
        b: Math.round(lerp(lo.color.b, hi.color.b, t)),
      }
    }
  }
  return STOPS[STOPS.length - 1].color
}

export function ndviToHex(value: number): string {
  const { r, g, b } = ndviToRgb(value)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function ndviToCssColor(value: number): string {
  const { r, g, b } = ndviToRgb(value)
  return `rgb(${r}, ${g}, ${b})`
}

export function ndviLabel(value: number, lang: 'uk' | 'en' = 'uk'): string {
  if (value < 0.1) return lang === 'uk' ? 'Гола поверхня' : 'Bare surface'
  if (value < 0.25) return lang === 'uk' ? 'Рідка рослинність' : 'Sparse vegetation'
  if (value < 0.45) return lang === 'uk' ? 'Помірна' : 'Moderate'
  if (value < 0.6) return lang === 'uk' ? 'Добра' : 'Good'
  return lang === 'uk' ? 'Відмінна' : 'Excellent'
}

export const NDVI_SCALE_STOPS = STOPS
