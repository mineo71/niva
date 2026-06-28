import apiClient from '@/lib/axios'
import type { AuthTokens, User } from '@/types'

export interface SignupPayload {
  email: string
  password: string
  full_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  signup: (data: SignupPayload) =>
    apiClient.post<AuthTokens>('/auth/signup', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', data).then((r) => r.data),

  refresh: () =>
    apiClient.post<AuthTokens>('/auth/refresh').then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),

  me: () =>
    apiClient.get<User>('/auth/me').then((r) => r.data),
}
