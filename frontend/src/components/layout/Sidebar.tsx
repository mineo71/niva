import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  Map,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { authApi } from '@/api/auth'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.overview', end: true },
  { to: '/dashboard/fields', icon: Layers, key: 'nav.fields' },
  { to: '/dashboard/map', icon: Map, key: 'nav.map' },
  { to: '/dashboard/profile', icon: User, key: 'settings.profile' },
  { to: '/dashboard/settings', icon: Settings, key: 'nav.settings' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebar } = useUIStore()
  const navigate = useNavigate()

  // collapse styling applies on desktop only (lg+); mobile drawer is always full-width
  const c = sidebarCollapsed

  const closeMobile = () => setMobileSidebar(false)

  const handleLogout = async () => {
    closeMobile()
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
    toast.success(t('sidebar.loggedOut'))
  }

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
          // mobile: fixed drawer, full width, slide in/out
          'fixed inset-y-0 left-0 w-64',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // desktop: static, collapsible
          'lg:static lg:translate-x-0 lg:transition-[width]',
          c ? 'lg:w-14' : 'lg:w-56'
        )}
      >
        {/* Logo + collapse toggle (top) */}
        <div
          className={cn(
            'flex items-center gap-2.5 border-b border-[#e5e7eb] h-14 px-4',
            c && 'lg:flex-col lg:justify-center lg:gap-1.5 lg:px-0'
          )}
        >
          <div className="flex items-center gap-2.5">
            <img src="/niva-logo.png" alt="Niva" className="shrink-0 w-9 h-9 rounded-lg" />
            <span className={cn('font-semibold text-[#111827] text-[15px] tracking-tight', c && 'lg:hidden')}>
              Нива
            </span>
          </div>

          {/* desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            aria-label={c ? t('sidebar.expandMenu') : t('sidebar.collapseMenu')}
            className={cn(
              'hidden lg:flex w-6 h-6 rounded-md items-center justify-center shrink-0',
              'text-[#9ca3af] hover:text-[#374151] hover:bg-white border border-transparent hover:border-[#e5e7eb]',
              'transition-colors duration-150',
              !c && 'ml-auto'
            )}
          >
            {c ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* mobile close */}
          <button
            onClick={closeMobile}
            aria-label={t('sidebar.closeMenu')}
            className="lg:hidden ml-auto w-7 h-7 rounded-md flex items-center justify-center text-[#9ca3af] hover:text-[#374151] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, key, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobile}
              title={c ? t(key) : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-[#f0fdf4] text-[#16a34a]'
                    : 'text-[#6b7280] hover:text-[#111827] hover:bg-white',
                  c && 'lg:justify-center lg:px-0'
                )
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className={cn(c && 'lg:hidden')}>{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2.5 py-3 border-t border-[#e5e7eb]">
          <button
            onClick={handleLogout}
            title={c ? t('nav.logout') : undefined}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium',
              'text-[#6b7280] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors duration-150',
              c && 'lg:justify-center lg:px-0'
            )}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={cn(c && 'lg:hidden')}>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
