import apiClient from '@/lib/axios'
import type { FieldResponse, CreateFieldPayload, UpdateFieldPayload } from '@/types'

export const fieldsApi = {
  list: () =>
    apiClient.get<FieldResponse[]>('/fields').then((r) => r.data),

  create: (data: CreateFieldPayload) =>
    apiClient.post<FieldResponse>('/fields', data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<FieldResponse>(`/fields/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateFieldPayload) =>
    apiClient.put<FieldResponse>(`/fields/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/fields/${id}`).then((r) => r.data),
}
