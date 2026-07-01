import { Globe, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/stores/uiStore'
import { LANGUAGES } from '@/lib/languages'
import { cn } from '@/lib/utils'

/** Compact interface-language switcher (native <select> for reliability + a11y). */
export function LanguageSelect({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const { language, setLanguage } = useUIStore()

  const change = (code: string) => {
    setLanguage(code)
    i18n.changeLanguage(code)
    document.documentElement.lang = code
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Globe size={14} className="absolute left-2.5 text-[#9ca3af] pointer-events-none" />
      <ChevronDown size={13} className="absolute right-2 text-[#9ca3af] pointer-events-none" />
      <select
        aria-label={t('common.interfaceLanguage')}
        value={language}
        onChange={(e) => change(e.target.value)}
        className="h-8 pl-8 pr-7 rounded-lg text-xs font-medium text-[#374151] bg-white
          border border-[#e5e7eb] hover:border-[#d1d5db] focus:border-[#16a34a]
          focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20
          appearance-none cursor-pointer transition-colors duration-150"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>{l.native}</option>
        ))}
      </select>
    </div>
  )
}
