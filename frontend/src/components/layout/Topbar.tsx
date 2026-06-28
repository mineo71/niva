import { Bell, Globe } from 'lucide-react'
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
    <header className="h-14 flex items-center justify-end gap-2 px-6 border-b border-[#1e3022] bg-[#070d09] shrink-0">
      {/* Lang toggle */}
      <button
        onClick={toggleLang}
        className={cn(
          'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium font-mono',
          'text-[#6b9e78] hover:text-[#f0f4f1] hover:bg-[#112018]',
          'border border-transparent hover:border-[#1e3022]',
          'transition-all duration-150'
        )}
        title={language === 'uk' ? 'Switch to English' : 'Перейти на Українську'}
      >
        <Globe size={14} />
        {language === 'uk' ? 'УКР' : 'ENG'}
      </button>

      {/* Notifications (placeholder) */}
      <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#6b9e78] hover:text-[#f0f4f1] hover:bg-[#112018] transition-colors">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-2.5 ml-1">
        <div className="w-8 h-8 rounded-lg bg-[#1e3d27] border border-[#2d4a34] flex items-center justify-center text-xs font-semibold text-[#4ade80] font-display">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-[#f0f4f1] leading-none">
            {user?.full_name ?? user?.email ?? '—'}
          </p>
          {user?.full_name && (
            <p className="text-[10px] text-[#6b9e78] leading-none mt-0.5">{user.email}</p>
          )}
        </div>
      </div>
    </header>
  )
}
