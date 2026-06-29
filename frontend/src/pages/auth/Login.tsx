import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Satellite } from 'lucide-react'
import { toast } from 'react-toastify'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FormData { email: string; password: string }

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const schema = useMemo(() => yup.object({
    email: yup.string().email(t('auth.invalidEmail')).required(t('auth.emailRequired')),
    password: yup.string().min(6, t('auth.minPassword')).required(t('auth.passwordRequired')),
  }), [t])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const tokens = await authApi.login(data)
      setAuth(tokens.access_token, null)
      try {
        const me = await authApi.me()
        setAuth(tokens.access_token, me)
      } catch { /* non-critical */ }
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg ?? t('auth.loginError'))
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#16a34a] flex items-center justify-center mb-4 shadow-sm">
            <Satellite size={20} className="text-white" />
          </div>
          <h1 className="font-semibold text-xl text-[#111827] tracking-tight">Нива</h1>
          <p className="text-sm text-[#6b7280] mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="farmer@example.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" loading={isSubmitting} className="w-full mt-2" size="lg">
              {t('auth.login')}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-5">
          {t('auth.noAccount')}{' '}
          <Link to="/auth/signup" className="text-[#16a34a] hover:text-[#15803d] font-medium transition-colors">
            {t('auth.signup')}
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-[#9ca3af] hover:text-[#6b7280] transition-colors">
            {t('auth.backToHome')}
          </Link>
        </p>
      </div>
    </div>
  )
}
