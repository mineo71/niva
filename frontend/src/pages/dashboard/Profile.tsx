import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Save, Globe, Settings as SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { LANGUAGES } from '@/lib/languages'

export function Profile() {
  const { i18n } = useTranslation()
  const { user, setUser } = useAuthStore()
  const isUk = i18n.language === 'uk'

  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFullName(user?.full_name ?? '')
  }, [user])

  const initial = (user?.full_name ?? user?.email ?? '?')[0]?.toUpperCase()
  const langName = LANGUAGES.find((l) => l.code === (user?.language ?? i18n.language))?.native ?? '—'
  const dirty = fullName.trim() !== (user?.full_name ?? '')

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await authApi.updateMe({ full_name: fullName.trim() })
      setUser(updated)
      toast.success(isUk ? 'Профіль оновлено' : 'Profile updated')
    } catch {
      toast.error(isUk ? 'Помилка оновлення' : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-semibold text-xl text-[#111827] tracking-tight">
          {isUk ? 'Профіль' : 'Profile'}
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {isUk ? 'Ваші особисті дані' : 'Your personal information'}
        </p>
      </div>

      {/* Identity */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-2xl font-semibold text-[#16a34a] shrink-0"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-lg text-[#111827] truncate">
              {user?.full_name ?? (isUk ? 'Без імені' : 'No name')}
            </p>
            <p className="text-sm text-[#9ca3af] truncate">{user?.email}</p>
          </div>
        </CardBody>
      </Card>

      {/* Editable details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={15} className="text-[#16a34a]" />
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Особисті дані' : 'Personal details'}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            id="profile-fullname"
            label={isUk ? "Повне ім'я" : 'Full name'}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isUk ? 'Іван Франко' : 'John Doe'}
            leftIcon={<User size={14} />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#f9fafb] rounded-lg px-3 py-2.5 border border-[#f3f4f6]">
              <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <Mail size={11} /> Email
              </p>
              <p className="text-sm text-[#374151] font-medium truncate">{user?.email}</p>
            </div>
            <div className="bg-[#f9fafb] rounded-lg px-3 py-2.5 border border-[#f3f4f6]">
              <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <Globe size={11} /> {isUk ? 'Мова' : 'Language'}
              </p>
              <p className="text-sm text-[#374151] font-medium">{langName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              to="/dashboard/settings"
              className="text-xs text-[#6b7280] hover:text-[#16a34a] inline-flex items-center gap-1 transition-colors"
            >
              <SettingsIcon size={13} />
              {isUk ? 'Змінити мову в налаштуваннях' : 'Change language in settings'}
            </Link>
            <Button onClick={handleSave} loading={saving} disabled={!dirty} icon={<Save size={14} />}>
              {isUk ? 'Зберегти' : 'Save'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
