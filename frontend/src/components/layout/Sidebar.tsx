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
  const { t, i18n } = useTranslation()
  const { logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const isUk = i18n.language === 'uk'

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
    toast.success(isUk ? 'Ви вийшли з системи' : 'Signed out successfully')
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[#070d09] border-r border-[#1e3022]',
        'transition-all duration-300 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-[#1e3022]',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#4ade80] flex items-center justify-center">
          <Satellite size={16} className="text-[#040a06]" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-display font-bold text-[#f0f4f1] text-lg leading-none tracking-tight">Нива</p>
            <p className="text-[10px] text-[#6b9e78] leading-none mt-0.5 font-mono uppercase tracking-widest">Satellite</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, labelUk, labelEn, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20'
                  : 'text-[#6b9e78] hover:text-[#f0f4f1] hover:bg-[#112018] border border-transparent',
                sidebarCollapsed && 'justify-center px-0'
              )
            }
            title={sidebarCollapsed ? (isUk ? labelUk : labelEn) : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!sidebarCollapsed && (isUk ? labelUk : labelEn)}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-3 border-t border-[#1e3022] space-y-0.5">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-[#6b9e78] hover:text-[#ef4444] hover:bg-[#ef4444]/5 border border-transparent',
            'transition-all duration-150',
            sidebarCollapsed && 'justify-center px-0'
          )}
          title={sidebarCollapsed ? (isUk ? 'Вийти' : 'Log out') : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!sidebarCollapsed && t('nav.logout', isUk ? 'Вийти' : 'Log out')}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
          bg-[#112018] border border-[#2d4a34] flex items-center justify-center
          text-[#6b9e78] hover:text-[#4ade80] hover:border-[#4ade80]/50
          transition-all duration-200 z-10 shadow-md"
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
