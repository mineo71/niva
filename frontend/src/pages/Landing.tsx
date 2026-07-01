import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Satellite,
  Leaf,
  CloudRain,
  TrendingUp,
  ArrowRight,
  Layers,
  BarChart3,
  Map,
  Check,
  Pencil,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  ChevronDown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { LanguageSelect } from '@/components/LanguageSelect'

const featureIcons = [Satellite, TrendingUp, CloudRain, Leaf, Map, BarChart3]

export function Landing() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`landing.q${n}`),
    a: t(`landing.a${n}`),
  }))

  const navLinks = [
    { href: '#showcase', label: t('landing.showcaseLabel') },
    { href: '#features', label: t('landing.featuresLabel') },
    { href: '#faq', label: t('landing.faqLabel') },
  ]

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

  const heroPoints = [t('landing.heroPoint1'), t('landing.heroPoint2'), t('landing.heroPoint3')]

  // Alternating product showcase rows — real screenshots as thumbnails
  const showcase = [
    {
      img: '/shots/map.jpg',
      icon: Pencil,
      title: t('landing.show1Title'),
      desc: t('landing.show1Desc'),
      bullets: [t('landing.show1B1'), t('landing.show1B2'), t('landing.show1B3')],
    },
    {
      img: '/shots/detail.jpg',
      icon: Satellite,
      title: t('landing.show2Title'),
      desc: t('landing.show2Desc'),
      bullets: [t('landing.show2B1'), t('landing.show2B2'), t('landing.show2B3')],
    },
    {
      img: '/shots/overview.jpg',
      icon: Sparkles,
      title: t('landing.show3Title'),
      desc: t('landing.show3Desc'),
      bullets: [t('landing.show3B1'), t('landing.show3B2'), t('landing.show3B3')],
    },
  ]

  const advantages = [
    { icon: Satellite, title: t('landing.adv1Title'), desc: t('landing.adv1Desc') },
    { icon: Zap, title: t('landing.adv2Title'), desc: t('landing.adv2Desc') },
    { icon: ShieldCheck, title: t('landing.adv3Title'), desc: t('landing.adv3Desc') },
    { icon: Globe, title: t('landing.adv4Title'), desc: t('landing.adv4Desc') },
  ]

  const steps = [
    { n: '01', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { n: '02', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { n: '03', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
  ]

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 h-14 border-b border-[#f3f4f6] bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <img src="/niva-logo.png" alt="Niva" className="w-9 h-9 rounded-lg" />
          <span className="hidden sm:inline font-semibold text-[#111827] text-lg tracking-tight">Нива</span>
        </div>
        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelect />
          <Link
            to="/auth/login"
            className="hidden sm:inline text-sm text-[#6b7280] hover:text-[#111827] transition-colors font-medium"
          >
            {t('landing.login')}
          </Link>
          <Link to="/auth/signup">
            <Button size="sm" className="whitespace-nowrap">{t('landing.startFree')}</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* soft gradient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, #f0fdf4 0%, rgba(240,253,244,0) 70%)',
          }}
        />
        <div className="pt-28 pb-12 px-6 text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] text-xs text-[#16a34a] font-medium mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
            {t('landing.heroBadge')}
          </div>

          <h1 className="font-semibold text-4xl md:text-6xl leading-[1.05] tracking-tight text-[#111827] mb-5">
            {t('landing.heroTitle1')}<br />
            <span className="text-[#16a34a]">{t('landing.heroTitle2')}</span>
          </h1>

          <p className="text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed mb-8">
            {t('landing.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
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

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#6b7280]">
            {heroPoints.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[#16a34a]" />
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Hero product screenshot */}
        <div className="px-6 max-w-5xl mx-auto pb-4">
          <div className="relative rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_20px_60px_-20px_rgba(16,163,74,0.25)] overflow-hidden">
            <div className="h-9 bg-[#f9fafb] border-b border-[#f3f4f6] flex items-center gap-1.5 px-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#fde68a]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#bbf7d0]" />
            </div>
            <img
              src="/shots/overview.jpg"
              alt="Niva dashboard"
              className="w-full block"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── Powered by ── */}
      <section className="px-6 pt-6 pb-10">
        <p className="text-center text-xs uppercase tracking-widest text-[#9ca3af] mb-4">
          {t('landing.poweredBy')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-[#6b7280]">
          <span className="inline-flex items-center gap-1.5"><Satellite size={15} className="text-[#16a34a]" /> Sentinel-2</span>
          <span className="inline-flex items-center gap-1.5"><CloudRain size={15} className="text-[#16a34a]" /> OpenWeatherMap</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles size={15} className="text-[#16a34a]" /> Groq AI</span>
          <span className="inline-flex items-center gap-1.5"><TrendingUp size={15} className="text-[#16a34a]" /> scikit-learn</span>
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

      {/* ── Product showcase (thumbnails) ── */}
      <section id="showcase" className="scroll-mt-20 px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs text-[#16a34a] font-semibold uppercase tracking-widest mb-3">
            {t('landing.showcaseLabel')}
          </p>
          <h2 className="font-semibold text-2xl md:text-3xl text-[#111827] tracking-tight">
            {t('landing.showcaseTitle')}
          </h2>
        </div>

        <div className="space-y-16">
          {showcase.map((row, i) => {
            const Icon = row.icon
            const flip = i % 2 === 1
            return (
              <div
                key={i}
                className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
              >
                {/* text */}
                <div className={flip ? 'md:order-2' : ''}>
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mb-4">
                    <Icon size={19} className="text-[#16a34a]" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#111827] mb-2 tracking-tight">{row.title}</h3>
                  <p className="text-[#6b7280] leading-relaxed mb-5">{row.desc}</p>
                  <ul className="space-y-2.5">
                    {row.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-[#374151]">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                          <Check size={11} className="text-[#16a34a]" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* thumbnail */}
                <div className={flip ? 'md:order-1' : ''}>
                  <div className="rounded-xl border border-[#e5e7eb] overflow-hidden shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)] bg-white hover:shadow-[0_16px_50px_-16px_rgba(16,163,74,0.30)] transition-shadow duration-300">
                    <img src={row.img} alt={row.title} loading="lazy" className="w-full block" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Advantages ── */}
      <section className="bg-[#fafafa] border-y border-[#f3f4f6]">
        <div className="px-6 py-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-[#16a34a] font-semibold uppercase tracking-widest mb-3">
              {t('landing.advLabel')}
            </p>
            <h2 className="font-semibold text-2xl md:text-3xl text-[#111827] tracking-tight">
              {t('landing.advTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advantages.map((a, i) => {
              const Icon = a.icon
              return (
                <div key={i} className="bg-white border border-[#e5e7eb] rounded-xl p-5">
                  <div className="w-9 h-9 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mb-4">
                    <Icon size={17} className="text-[#16a34a]" />
                  </div>
                  <h3 className="font-semibold text-sm text-[#111827] mb-1.5">{a.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{a.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="scroll-mt-20 px-6 py-20 max-w-5xl mx-auto">
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
                className="bg-white border border-[#e5e7eb] rounded-xl p-5 hover:border-[#bbf7d0] hover:shadow-sm transition-all duration-150"
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

      {/* ── How it works ── */}
      <section className="bg-[#fafafa] border-y border-[#f3f4f6]">
        <div className="px-6 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-[#16a34a] font-semibold uppercase tracking-widest mb-3">
              {t('landing.howLabel')}
            </p>
            <h2 className="font-semibold text-2xl md:text-3xl text-[#111827] tracking-tight">
              {t('landing.howTitle')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative bg-white border border-[#e5e7eb] rounded-xl p-6">
                <span className="font-semibold text-3xl text-[#bbf7d0] tabular-nums">{s.n}</span>
                <h3 className="font-semibold text-base text-[#111827] mt-2 mb-1.5">{s.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-20 px-6 py-20 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-[#16a34a] font-semibold uppercase tracking-widest mb-3">
            {t('landing.faqLabel')}
          </p>
          <h2 className="font-semibold text-2xl md:text-3xl text-[#111827] tracking-tight">
            {t('landing.faqTitle')}
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const open = openFaq === i
            return (
              <div
                key={i}
                className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer hover:bg-[#fafafa] transition-colors"
                >
                  <span className="font-medium text-sm text-[#111827]">{f.q}</span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-[#9ca3af] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-200 ease-in-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-[#6b7280] leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center bg-[#16a34a] rounded-2xl p-10 sm:p-12">
          <Layers size={32} className="text-white mx-auto mb-4 opacity-90" />
          <h2 className="font-semibold text-2xl sm:text-3xl text-white mb-3 tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-[#dcfce7] text-sm mb-7 max-w-md mx-auto">
            {t('landing.ctaDesc')}
          </p>
          <Link to="/auth/signup">
            <Button
              size="lg"
              icon={<ArrowRight size={18} />}
              className="bg-white !text-[#16a34a] hover:bg-[#f0fdf4] active:bg-[#dcfce7]"
            >
              {t('landing.ctaButton')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#f3f4f6] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/niva-logo.png" alt="Niva" className="w-6 h-6 rounded" />
          <span className="font-semibold text-[#374151] text-sm">Нива</span>
        </div>
        <p className="text-xs text-[#9ca3af]">{t('landing.footerCopyright')}</p>
      </footer>
    </div>
  )
}
