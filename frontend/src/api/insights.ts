import apiClient from '@/lib/axios'
import type { IndicesResponse, WeatherResponse, PredictResponse, ReportResponse } from '@/types'

export const insightsApi = {
  indices: (fieldId: string) =>
    apiClient.get<IndicesResponse>(`/fields/${fieldId}/indices`).then((r) => r.data),

  weather: (fieldId: string) =>
    apiClient.get<WeatherResponse>(`/fields/${fieldId}/weather`).then((r) => r.data),

  predict: (fieldId: string) =>
    apiClient.post<PredictResponse>(`/fields/${fieldId}/predict`).then((r) => r.data),

  report: (fieldId: string) =>
    apiClient.post<ReportResponse>(`/fields/${fieldId}/report`).then((r) => r.data),
}
