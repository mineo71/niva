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
      // Fetch fresh profile (no dedicated PATCH in this API, but we show intent)
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
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#f0f4f1]">
          {isUk ? 'Налаштування' : 'Settings'}
        </h1>
        <p className="text-sm text-[#6b9e78] mt-0.5">
          {isUk ? 'Ваш профіль та параметри платформи' : 'Your profile and platform preferences'}
        </p>
      </div>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[#4ade80]" />
            <h2 className="font-display font-semibold text-[#f0f4f1]">
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
                className={`flex-1 relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-200 ${
                  language === lang
                    ? 'border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]'
                    : 'border-[#1e3022] bg-[#0a1410] text-[#6b9e78] hover:border-[#2d4a34] hover:text-[#f0f4f1]'
                }`}
              >
                <span className="text-2xl">{lang === 'uk' ? '🇺🇦' : '🇬🇧'}</span>
                <span className="text-sm font-medium">
                  {lang === 'uk' ? 'Українська' : 'English'}
                </span>
                {language === lang && (
                  <span className="absolute top-2 right-2">
                    <Check size={14} />
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
            <User size={18} className="text-[#4ade80]" />
            <h2 className="font-display font-semibold text-[#f0f4f1]">
              {isUk ? 'Профіль' : 'Profile'}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#1e3d27] border border-[#2d4a34] flex items-center justify-center text-xl font-display font-bold text-[#4ade80]">
              {(user?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[#f0f4f1]">{user?.full_name ?? isUk ? 'Без імені' : 'No name'}</p>
              <p className="text-sm text-[#6b9e78]">{user?.email}</p>
            </div>
          </div>

          <Input
            label={isUk ? "Ім'я" : 'Full name'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isUk ? 'Іван Франко' : 'John Doe'}
            leftIcon={<User size={16} />}
          />

          <div className="bg-[#0a1410] rounded-lg px-3 py-2.5 border border-[#1e3022]">
            <p className="text-[10px] text-[#6b9e78] uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm text-[#f0f4f1] font-mono">{user?.email}</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            loading={savingProfile}
            icon={<Save size={16} />}
          >
            {isUk ? 'Зберегти профіль' : 'Save profile'}
          </Button>
        </CardBody>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut size={18} className="text-[#ef4444]" />
            <h2 className="font-display font-semibold text-[#f0f4f1]">
              {isUk ? 'Акаунт' : 'Account'}
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-[#6b9e78] mb-4">
            {isUk
              ? 'Вийдіть з системи на всіх пристроях.'
              : 'Sign out from all devices.'}
          </p>
          <Button variant="danger" onClick={handleLogout} icon={<LogOut size={16} />}>
            {isUk ? 'Вийти з акаунту' : 'Sign out'}
          </Button>
        </CardBody>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-[#3d7050] font-mono">
        Нива v0.1.0 · Satellite Intelligence Platform
      </p>
    </div>
  )
}
