import { Globe, ChevronDown, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { LANGUAGES } from '@/lib/languages'

export function Topbar() {
  const { i18n, t } = useTranslation()
  const { user } = useAuthStore()
  const { language, setLanguage, setMobileSidebar } = useUIStore()

  const changeLang = (code: string) => {
    setLanguage(code)
    i18n.changeLanguage(code)
    document.documentElement.lang = code
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="h-14 flex items-center gap-2 px-4 sm:px-5 border-b border-[#e5e7eb] bg-white shrink-0">
      {/* Mobile menu */}
      <button
        onClick={() => setMobileSidebar(true)}
        aria-label={t('sidebar.openMenu')}
        className="lg:hidden w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-[#6b7280] hover:text-[#111827] hover:bg-[#f9fafb] transition-colors"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      {/* Lang selector */}
      <div className="relative flex items-center">
        <Globe size={14} className="absolute left-2.5 text-[#9ca3af] pointer-events-none" />
        <ChevronDown size={13} className="absolute right-2 text-[#9ca3af] pointer-events-none" />
        <select
          aria-label="Interface language"
          value={language}
          onChange={(e) => changeLang(e.target.value)}
          className="h-8 pl-8 pr-7 rounded-lg text-xs font-medium text-[#374151] bg-white
            border border-transparent hover:border-[#e5e7eb] focus:border-[#16a34a]
            focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20
            appearance-none cursor-pointer transition-colors duration-150"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.native}</option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-[#e5e7eb]" />

      {/* Avatar + name */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-xs font-semibold text-[#16a34a]">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-[#111827] leading-none">
            {user?.full_name ?? user?.email ?? '—'}
          </p>
          {user?.full_name && (
            <p className="text-[10px] text-[#9ca3af] leading-none mt-0.5">{user.email}</p>
          )}
        </div>
      </div>
    </header>
  )
}
