import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/uiStore'

/**
 * Minimal top bar shown on mobile/tablet only (< lg).
 * Just the drawer trigger + brand — no language/profile controls
 * (language lives in Settings, profile in the sidebar).
 */
export function MobileHeader() {
  const { t } = useTranslation()
  const { setMobileSidebar } = useUIStore()

  return (
    <header className="lg:hidden h-14 flex items-center gap-3 px-4 border-b border-[#e5e7eb] bg-white shrink-0">
      <button
        onClick={() => setMobileSidebar(true)}
        aria-label={t('sidebar.openMenu')}
        className="w-10 h-10 -ml-1 rounded-lg flex items-center justify-center text-[#374151] hover:bg-[#f9fafb] transition-colors"
      >
        <Menu size={24} />
      </button>
      <img src="/niva-logo.png" alt="Niva" className="w-8 h-8 rounded-lg" />
      <span className="font-semibold text-[#111827] text-base tracking-tight">Нива</span>
    </header>
  )
}
