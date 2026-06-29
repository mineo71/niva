import { Link, useNavigate } from 'react-router-dom'
import { Globe, LogOut, User, ChevronRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { LANGUAGES } from '@/lib/languages'

export function SettingsPage() {
  const { i18n, t } = useTranslation()
  const { user, setUser, logout } = useAuthStore()
  const { language, setLanguage } = useUIStore()
  const navigate = useNavigate()
  const isUk = i18n.language === 'uk'

  const handleLanguage = async (code: string) => {
    setLanguage(code)
    i18n.changeLanguage(code)
    document.documentElement.lang = code
    // best-effort persist to the account; ignore failure
    try {
      const updated = await authApi.updateMe({ language: code })
      setUser(updated)
    } catch { /* offline / not critical */ }
    toast.success(t('settings.languageChanged', { defaultValue: isUk ? 'Мову змінено' : 'Language changed' }))
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
    toast.success(isUk ? 'Ви вийшли з системи' : 'Signed out')
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-semibold text-xl text-[#111827] tracking-tight">
          {isUk ? 'Налаштування' : 'Settings'}
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {isUk ? 'Параметри платформи' : 'Platform preferences'}
        </p>
      </div>

      {/* Profile shortcut */}
      <Link to="/dashboard/profile" className="block">
        <Card hover>
          <CardBody className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center shrink-0">
              <User size={16} className="text-[#16a34a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-[#111827]">{isUk ? 'Профіль' : 'Profile'}</p>
              <p className="text-xs text-[#9ca3af] truncate">{user?.email}</p>
            </div>
            <ChevronRight size={16} className="text-[#d1d5db] shrink-0" />
          </CardBody>
        </Card>
      </Link>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-[#16a34a]" />
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Мова інтерфейсу' : 'Interface language'}
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {
              const active = language === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguage(lang.code)}
                  aria-pressed={active}
                  className={`relative flex flex-col items-start gap-0.5 py-2.5 px-3 rounded-lg border text-left transition-all duration-150 ${
                    active
                      ? 'border-[#16a34a] bg-[#f0fdf4]'
                      : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db] hover:bg-[#fafafa]'
                  }`}
                >
                  <span className={`text-sm font-medium ${active ? 'text-[#16a34a]' : 'text-[#111827]'}`}>
                    {lang.native}
                  </span>
                  <span className="text-[11px] text-[#9ca3af] uppercase tracking-wide">{lang.code}</span>
                  {active && <Check size={13} className="absolute top-2 right-2 text-[#16a34a]" />}
                </button>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut size={15} className="text-[#dc2626]" />
            <h2 className="font-semibold text-sm text-[#111827]">{isUk ? 'Акаунт' : 'Account'}</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-[#6b7280] mb-4">
            {isUk ? 'Вийти з системи.' : 'Sign out of your account.'}
          </p>
          <Button variant="danger" onClick={handleLogout} icon={<LogOut size={14} />}>
            {isUk ? 'Вийти з акаунту' : 'Sign out'}
          </Button>
        </CardBody>
      </Card>

      <p className="text-center text-xs text-[#9ca3af]">
        Нива v0.1.0 · Satellite Intelligence Platform
      </p>
    </div>
  )
}
