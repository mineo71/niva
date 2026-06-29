import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  language: string
  ndviLayerVisible: boolean
  sidebarCollapsed: boolean
  setLanguage: (lang: string) => void
  toggleNdviLayer: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'uk',
      ndviLayerVisible: true,
      sidebarCollapsed: false,

      setLanguage: (lang) => set({ language: lang }),
      toggleNdviLayer: () => set((s) => ({ ndviLayerVisible: !s.ndviLayerVisible })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'niva-ui',
    }
  )
)
