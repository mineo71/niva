import { Link } from 'react-router-dom'
import { Satellite, Leaf, CloudRain, TrendingUp, ArrowRight, Layers, BarChart3, Map } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

const featureIcons = [Satellite, TrendingUp, CloudRain, Leaf, Map, BarChart3]

export function Landing() {
  const { t } = useTranslation()

  const features = featureIcons.map((icon, i) => ({
    icon,
    title: t(`landing.feat${i + 1}Title`),
    desc: t(`landing.feat${i + 1}Desc`),
  }))

  const stats = [
    { value: '5d', label: t('landing.statsUpdateCycle') },
    { value: '10 m', label: t('landing.statsResolution') },
    { value: '8+', label: t('landing.statsCrops') },
    { value: '99.9%', label: t('landing.statsUptime') },
  ]

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b border-[#f3f4f6] bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#16a34a] flex items-center justify-center">
            <Satellite size={14} className="text-white" />
          </div>
          <span className="font-semibold text-[#111827] tracking-tight">Нива</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth/login"
            className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors font-medium"
          >
            {t('landing.login')}
          </Link>
          <Link to="/auth/signup">
            <Button size="sm">{t('landing.startFree')}</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 text-center max-w-3xl mx-auto animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] text-xs text-[#16a34a] font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
          Agtech · Satellite Intelligence
        </div>

        <h1 className="font-semibold text-4xl md:text-6xl leading-tight tracking-tight text-[#111827] mb-5">
          {t('landing.heroTitle1')}<br />
          <span className="text-[#16a34a]">{t('landing.heroTitle2')}</span>
        </h1>

        <p className="text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed mb-9">
          {t('landing.heroDesc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/auth/signup">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              {t('landing.startFree')}
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg">
              {t('landing.signInBtn')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[#f3f4f6] bg-[#fafafa]">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#f3f4f6]">
          {stats.map((s) => (
            <div key={s.value} className="px-6 py-6 text-center">
              <p className="font-semibold text-2xl text-[#16a34a] tabular-nums">{s.value}</p>
              <p className="text-xs text-[#6b7280] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs text-[#16a34a] font-semibold uppercase tracking-widest mb-3">{t('landing.featuresLabel')}</p>
          <h2 className="font-semibold text-2xl md:text-3xl text-[#111827] tracking-tight">
            {t('landing.featuresSectionTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="bg-white border border-[#e5e7eb] rounded-xl p-5 hover:border-[#d1d5db] hover:shadow-sm transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mb-4">
                  <Icon size={17} className="text-[#16a34a]" />
                </div>
                <h3 className="font-semibold text-sm text-[#111827] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-16">
        <div className="max-w-xl mx-auto text-center bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-10">
          <Layers size={32} className="text-[#16a34a] mx-auto mb-4 opacity-80" />
          <h2 className="font-semibold text-2xl text-[#111827] mb-3 tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-[#6b7280] text-sm mb-6">
            {t('landing.ctaDesc')}
          </p>
          <Link to="/auth/signup">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              {t('landing.ctaButton')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#f3f4f6] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#16a34a] flex items-center justify-center">
            <Satellite size={12} className="text-white" />
          </div>
          <span className="font-semibold text-[#374151] text-sm">Нива</span>
        </div>
        <p className="text-xs text-[#9ca3af]">{t('landing.footerCopyright')}</p>
      </footer>
    </div>
  )
}
