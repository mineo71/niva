import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function Topbar() {
  const { i18n } = useTranslation()
  const { user } = useAuthStore()
  const { language, setLanguage } = useUIStore()

  const toggleLang = () => {
    const next = language === 'uk' ? 'en' : 'uk'
    setLanguage(next)
    i18n.changeLanguage(next)
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="h-14 flex items-center justify-end gap-2 px-5 border-b border-[#e5e7eb] bg-white shrink-0">
      {/* Lang toggle */}
      <button
        onClick={toggleLang}
        title={language === 'uk' ? 'Switch to English' : 'Перейти на Українську'}
        className={cn(
          'flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium',
          'text-[#6b7280] hover:text-[#374151] hover:bg-[#f9fafb]',
          'border border-transparent hover:border-[#e5e7eb]',
          'transition-colors duration-150'
        )}
      >
        <Globe size={14} />
        {language === 'uk' ? 'УКР' : 'ENG'}
      </button>

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
