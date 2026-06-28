import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, User, LogOut, Save, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

export function SettingsPage() {
  const { i18n } = useTranslation()
  const { user, setUser, logout } = useAuthStore()
  const { language, setLanguage } = useUIStore()
  const navigate = useNavigate()
  const isUk = i18n.language === 'uk'

  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name)
  }, [user])

  const handleLanguage = (lang: 'uk' | 'en') => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    toast.success(lang === 'uk' ? 'Мову змінено на Українську' : 'Language changed to English')
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const me = await authApi.me()
      setUser({ ...me, full_name: fullName || me.full_name })
      toast.success(isUk ? 'Профіль оновлено' : 'Profile updated')
    } catch {
      toast.error(isUk ? 'Помилка оновлення' : 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate('/auth/login')
    toast.success(isUk ? 'Ви вийшли з системи' : 'Signed out')
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-semibold text-xl text-[#111827] tracking-tight">
          {isUk ? 'Налаштування' : 'Settings'}
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {isUk ? 'Ваш профіль та параметри платформи' : 'Your profile and platform preferences'}
        </p>
      </div>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-[#16a34a]" />
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Мова інтерфейсу' : 'Interface Language'}
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-3">
            {(['uk', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguage(lang)}
                className={`relative flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-150 ${
                  language === lang
                    ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]'
                    : 'border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#d1d5db] hover:bg-[#fafafa]'
                }`}
              >
                <span className="text-2xl">{lang === 'uk' ? '🇺🇦' : '🇬🇧'}</span>
                <span className="text-sm font-medium">
                  {lang === 'uk' ? 'Українська' : 'English'}
                </span>
                {language === lang && (
                  <span className="absolute top-2 right-2 text-[#16a34a]">
                    <Check size={13} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={15} className="text-[#16a34a]" />
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Профіль' : 'Profile'}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Avatar row */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#f3f4f6]">
            <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-lg font-semibold text-[#16a34a]">
              {(user?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[#111827] text-sm">{user?.full_name ?? (isUk ? 'Без імені' : 'No name')}</p>
              <p className="text-xs text-[#9ca3af]">{user?.email}</p>
            </div>
          </div>

          <Input
            label={isUk ? "Ім'я" : 'Full name'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isUk ? 'Іван Франко' : 'John Doe'}
            leftIcon={<User size={14} />}
          />

          <div className="bg-[#f9fafb] rounded-lg px-3 py-2.5 border border-[#f3f4f6]">
            <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-[#374151] font-medium">{user?.email}</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            loading={savingProfile}
            icon={<Save size={14} />}
          >
            {isUk ? 'Зберегти профіль' : 'Save profile'}
          </Button>
        </CardBody>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut size={15} className="text-[#dc2626]" />
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Акаунт' : 'Account'}
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-[#6b7280] mb-4">
            {isUk ? 'Вийдіть з системи на всіх пристроях.' : 'Sign out from all devices.'}
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
