import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User | null) => void
  setUser: (user: User) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      setUser: (user) =>
        set({ user }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),

      hydrate: () => {
        // Called on app init — Zustand persist handles rehydration automatically,
        // but this hook lets components trigger a manual sync if needed.
        const stored = localStorage.getItem('niva-auth')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.state?.token) {
              set({ isAuthenticated: true })
            }
          } catch {
            // ignore
          }
        }
      },
    }),
    {
      name: 'niva-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true
        }
      },
    }
  )
)
