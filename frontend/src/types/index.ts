// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  full_name?: string
  language?: string
}

export interface AuthTokens {
  access_token: string
  token_type?: string
}

// ── Fields ────────────────────────────────────────────────────────────────────
export type CropType =
  | 'wheat'
  | 'corn'
  | 'sunflower'
  | 'soybeans'
  | 'barley'
  | 'oats'
  | 'rye'
  | 'rapeseed'

export type SoilType = 'chalk' | 'peat' | 'sandy' | 'silt'

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface FieldResponse {
  id: string
  name: string
  crop_type: CropType
  soil_type: SoilType
  area_ha: number
  geometry: GeoJSONPolygon
  created_at: string
  latest_ndvi: number | null
}

export interface CreateFieldPayload {
  name: string
  crop_type: CropType
  soil_type: SoilType
  geometry: GeoJSONPolygon
}

export interface UpdateFieldPayload {
  name?: string
  crop_type?: CropType
  soil_type?: SoilType
  geometry?: GeoJSONPolygon
}

// ── Insights ──────────────────────────────────────────────────────────────────
export interface IndexDataPoint {
  date: string
  ndvi: number
  evi: number
  ndmi: number
  savi: number
}

export interface IndicesResponse {
  source: string
  series: IndexDataPoint[]
}

export interface WeatherCurrent {
  temp_c: number
  humidity: number
  description: string
}

export interface WeatherForecastDay {
  date: string
  temp_c: number
  rain_mm: number
  humidity: number
}

export interface WeatherResponse {
  source: string
  current: WeatherCurrent
  forecast: WeatherForecastDay[]
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type HealthLevel = 'good' | 'moderate' | 'poor'

export interface PredictResponse {
  yield_t_ha: number
  confidence: ConfidenceLevel
  features_filled_from_baseline: number
  inputs: Record<string, number>
}

export interface ReportResponse {
  source: string
  summary: string
  health: HealthLevel
  risks: string[]
  recommendations: string[]
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export interface CropDistributionItem {
  crop: string
  count: number
}

export interface StatsResponse {
  total_fields: number
  total_area_ha: number
  crop_distribution: CropDistributionItem[]
}
