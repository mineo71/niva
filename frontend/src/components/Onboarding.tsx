import { Link } from 'react-router-dom'
import { Pencil, Satellite, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

/**
 * First-run onboarding panel shown when the user has no fields yet.
 * Replaces the blank dashboard / empty list with a guided call to action.
 */
export function Onboarding() {
  const { t } = useTranslation()

  const steps = [
    { icon: Pencil, text: t('onboarding.step1') },
    { icon: Satellite, text: t('onboarding.step2') },
    { icon: Sparkles, text: t('onboarding.step3') },
  ]

  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4]">
        {/* soft accent glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 60% at 50% 0%, rgba(22,163,74,0.10) 0%, rgba(22,163,74,0) 70%)',
          }}
        />
        <div className="relative px-6 py-12 sm:py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#bbf7d0] shadow-sm flex items-center justify-center mx-auto mb-5">
            <Satellite size={26} className="text-[#16a34a]" />
          </div>

          <h2 className="font-semibold text-2xl text-[#111827] tracking-tight mb-2">
            {t('onboarding.title')}
          </h2>
          <p className="text-sm text-[#6b7280] max-w-md mx-auto mb-8">
            {t('onboarding.subtitle')}
          </p>

          {/* steps */}
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8 text-left">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={i}
                  className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
                      <Icon size={15} className="text-[#16a34a]" />
                    </div>
                    <span className="font-semibold text-sm text-[#bbf7d0] tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-[#374151] leading-relaxed">{s.text}</p>
                </div>
              )
            })}
          </div>

          <Link to="/dashboard/map">
            <Button size="lg" icon={<Plus size={17} />}>
              {t('onboarding.cta')}
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
