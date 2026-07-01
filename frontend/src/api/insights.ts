import apiClient from '@/lib/axios'
import type {
  IndicesResponse, WeatherResponse, PredictResponse, ReportResponse,
  TimelineResponse, HeatmapResponse,
} from '@/types'

export const insightsApi = {
  indices: (fieldId: string) =>
    apiClient.get<IndicesResponse>(`/fields/${fieldId}/indices`).then((r) => r.data),

  timeline: (fieldId: string) =>
    apiClient.get<TimelineResponse>(`/fields/${fieldId}/timeline`).then((r) => r.data),

  heatmap: (fieldId: string, date: string) =>
    apiClient
      .get<HeatmapResponse>(`/fields/${fieldId}/heatmap`, { params: { date } })
      .then((r) => r.data),

  weather: (fieldId: string) =>
    apiClient.get<WeatherResponse>(`/fields/${fieldId}/weather`).then((r) => r.data),

  predict: (fieldId: string) =>
    apiClient.post<PredictResponse>(`/fields/${fieldId}/predict`).then((r) => r.data),

  report: (fieldId: string) =>
    apiClient.post<ReportResponse>(`/fields/${fieldId}/report`).then((r) => r.data),
}
