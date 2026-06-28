import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  Map,
  Settings,
  LogOut,
  Satellite,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { authApi } from '@/api/auth'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelUk: 'Огляд', labelEn: 'Overview', end: true },
  { to: '/dashboard/fields', icon: Layers, labelUk: 'Поля', labelEn: 'Fields' },
  { to: '/dashboard/map', icon: Map, labelUk: 'Карта', labelEn: 'Map' },
  { to: '/dashboard/settings', icon: Settings, labelUk: 'Налаштування', labelEn: 'Settings' },
]

export function Sidebar() {
  const { i18n } = useTranslation()
  const { logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const isUk = i18n.language === 'uk'

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
    toast.success(isUk ? 'Ви вийшли з системи' : 'Signed out successfully')
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[#f9fafb] border-r border-[#e5e7eb] shrink-0',
        'transition-all duration-200 ease-in-out',
        sidebarCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-2.5 border-b border-[#e5e7eb] h-14 px-4',
          sidebarCollapsed && 'justify-center px-0'
        )}
      >
        <div className="shrink-0 w-7 h-7 rounded-lg bg-[#16a34a] flex items-center justify-center">
          <Satellite size={14} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-[#111827] text-[15px] tracking-tight">
            Нива
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, labelUk, labelEn, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={sidebarCollapsed ? (isUk ? labelUk : labelEn) : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-[#f0fdf4] text-[#16a34a]'
                  : 'text-[#6b7280] hover:text-[#111827] hover:bg-white',
                sidebarCollapsed && 'justify-center px-0'
              )
            }
          >
            <Icon size={16} className="shrink-0" />
            {!sidebarCollapsed && (isUk ? labelUk : labelEn)}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-[#e5e7eb]">
        <button
          onClick={handleLogout}
          title={sidebarCollapsed ? (isUk ? 'Вийти' : 'Log out') : undefined}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium',
            'text-[#6b7280] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors duration-150',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!sidebarCollapsed && (isUk ? 'Вийти' : 'Log out')}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
          bg-white border border-[#e5e7eb] shadow-sm flex items-center justify-center
          text-[#9ca3af] hover:text-[#374151] hover:border-[#d1d5db]
          transition-colors duration-150 z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  )
}
