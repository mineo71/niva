import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  language: string
  ndviLayerVisible: boolean
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  setLanguage: (lang: string) => void
  toggleNdviLayer: () => void
  toggleSidebar: () => void
  setMobileSidebar: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'uk',
      ndviLayerVisible: true,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,

      setLanguage: (lang) => set({ language: lang }),
      toggleNdviLayer: () => set((s) => ({ ndviLayerVisible: !s.ndviLayerVisible })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebar: (open) => set({ mobileSidebarOpen: open }),
    }),
    {
      name: 'niva-ui',
      partialize: (s) => ({ language: s.language, ndviLayerVisible: s.ndviLayerVisible, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
