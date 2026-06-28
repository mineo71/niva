import apiClient from '@/lib/axios'
import type { StatsResponse } from '@/types'

export const statsApi = {
  get: () =>
    apiClient.get<StatsResponse>('/stats').then((r) => r.data),
}
