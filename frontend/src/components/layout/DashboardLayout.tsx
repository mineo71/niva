import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'

export function DashboardLayout() {
  const { t } = useTranslation()
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-[#16a34a] focus:font-semibold focus:text-sm focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:border focus:border-[#bbf7d0]"
      >
        {t('common.skipToContent')}
      </a>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MobileHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-[#f9fafb] outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
