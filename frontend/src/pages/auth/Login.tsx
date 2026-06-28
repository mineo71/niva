import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Satellite } from 'lucide-react'
import { toast } from 'react-toastify'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = yup.object({
  email: yup.string().email("Невірний формат email").required("Email обов’язковий"),
  password: yup.string().min(6, "Мінімум 6 символів").required("Пароль обов’язковий"),
})

type FormData = yup.InferType<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const tokens = await authApi.login(data)
      setAuth(tokens.access_token, null)
      // Load user profile
      try {
        const me = await authApi.me()
        setAuth(tokens.access_token, me)
      } catch { /* non-critical */ }
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg ?? 'Помилка входу. Перевірте дані.')
    }
  }

  return (
    <div className="min-h-screen bg-[#040a06] flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 topo-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial from-[#4ade80]/4 via-transparent to-transparent" />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#4ade80] flex items-center justify-center mb-4 shadow-[0_0_32px_rgba(74,222,128,0.3)]">
            <Satellite size={24} className="text-[#040a06]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#f0f4f1]">Нива</h1>
          <p className="text-sm text-[#6b9e78] mt-1">Увійдіть у свій акаунт</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1a14] border border-[#1e3022] rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="farmer@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              Увійти
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6b9e78] mt-6">
          Немає акаунту?{' '}
          <Link to="/auth/signup" className="text-[#4ade80] hover:text-[#22c55e] font-medium transition-colors">
            Зареєструватись
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-[#3d7050] hover:text-[#6b9e78] transition-colors">
            ← На головну
          </Link>
        </p>
      </div>
    </div>
  )
}
