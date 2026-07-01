import type { FieldResponse } from '@/types'
import { ndviToHex } from './ndvi'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

/**
 * Mapbox Static Images URL: a satellite thumbnail of a field with its
 * polygon drawn on top, coloured by latest NDVI (green fallback).
 * Returns null when no token is configured.
 */
export function fieldPreviewUrl(
  field: FieldResponse,
  { w = 320, h = 176, retina = true }: { w?: number; h?: number; retina?: boolean } = {}
): string | null {
  if (!TOKEN || TOKEN.startsWith('pk.your')) return null

  const color = field.latest_ndvi != null ? ndviToHex(field.latest_ndvi) : '#16a34a'

  // GeoJSON overlay uses the simplestyle-spec properties
  const overlay = {
    type: 'Feature' as const,
    properties: {
      stroke: color,
      'stroke-width': 2,
      'stroke-opacity': 1,
      fill: color,
      'fill-opacity': 0.35,
    },
    geometry: field.geometry,
  }

  const enc = encodeURIComponent(JSON.stringify(overlay))
  const size = `${w}x${h}${retina ? '@2x' : ''}`
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/geojson(${enc})/auto/${size}?padding=28&access_token=${TOKEN}`
}
