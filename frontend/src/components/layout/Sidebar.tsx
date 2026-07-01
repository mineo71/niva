import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Layers,
  Map,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  icon: LucideIcon
  key: string
  end?: boolean
}

const mainNav: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.overview', end: true },
  { to: '/dashboard/fields', icon: Layers, key: 'nav.fields' },
  { to: '/dashboard/map', icon: Map, key: 'nav.map' },
]

const bottomNav: NavItem[] = [
  { to: '/dashboard/profile', icon: User, key: 'settings.profile' },
  { to: '/dashboard/settings', icon: Settings, key: 'nav.settings' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebar } = useUIStore()

  // collapse styling applies on desktop only (lg+); mobile drawer is always full-width
  const c = sidebarCollapsed

  const closeMobile = () => setMobileSidebar(false)

  // Nav items are large on mobile/tablet (drawer) and compact on desktop (lg+).
  const renderNavItem = ({ to, icon: Icon, key, end }: NavItem) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={closeMobile}
      title={c ? t(key) : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3.5 px-3.5 py-3 rounded-lg font-medium transition-colors duration-150',
          'text-base lg:text-[15px] lg:py-2.5 lg:px-3',
          isActive
            ? 'bg-[#f0fdf4] text-[#16a34a]'
            : 'text-[#6b7280] hover:text-[#111827] hover:bg-white',
          c && 'lg:justify-center lg:px-0'
        )
      }
    >
      <Icon className="size-6 lg:size-5 shrink-0" />
      <span className={cn(c && 'lg:hidden')}>{t(key)}</span>
    </NavLink>
  )

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-[#f9fafb] border-r border-[#e5e7eb] shrink-0 z-40',
          'transition-transform duration-200 ease-in-out',
          // mobile: fixed drawer, slide in/out
          'fixed inset-y-0 left-0 w-72',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // desktop: static, collapsible
          'lg:static lg:translate-x-0 lg:transition-[width]',
          c ? 'lg:w-16' : 'lg:w-56'
        )}
      >
        {/* Logo (top) */}
        <div
          className={cn(
            'flex items-center gap-2.5 border-b border-[#e5e7eb] h-14 px-4 shrink-0',
            c && 'lg:justify-center lg:px-0'
          )}
        >
          <img src="/niva-logo.png" alt="Niva" className="shrink-0 w-9 h-9 rounded-lg" />
          <span className={cn('font-semibold text-[#111827] text-base tracking-tight', c && 'lg:hidden')}>
            Нива
          </span>

          {/* mobile close */}
          <button
            onClick={closeMobile}
            aria-label={t('sidebar.closeMenu')}
            className="lg:hidden ml-auto w-9 h-9 rounded-md flex items-center justify-center text-[#9ca3af] hover:text-[#374151] hover:bg-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {mainNav.map(renderNavItem)}
        </nav>

        {/* Bottom: profile / settings / collapse / logout */}
        <div className="px-2.5 py-3 border-t border-[#e5e7eb] space-y-1">
          {bottomNav.map(renderNavItem)}

          {/* desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            aria-label={c ? t('sidebar.expandMenu') : t('sidebar.collapseMenu')}
            className={cn(
              'hidden lg:flex w-full items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium',
              'text-[#9ca3af] hover:text-[#374151] hover:bg-white transition-colors duration-150',
              c && 'lg:justify-center lg:px-0'
            )}
          >
            {c ? <ChevronRight className="size-5 shrink-0" /> : <ChevronLeft className="size-5 shrink-0" />}
            <span className={cn(c && 'lg:hidden')}>{t('sidebar.collapseMenu')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
