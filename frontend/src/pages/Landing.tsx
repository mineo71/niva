import { Link } from 'react-router-dom'
import { Satellite, Leaf, CloudRain, TrendingUp, ArrowRight, Layers, BarChart3, Map } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: Satellite,
    titleUk: 'Супутникові індекси',
    descUk: 'NDVI, EVI, NDMI з Sentinel-2 кожні 5 днів. Відстежуйте стан рослинності з космосу.',
    titleEn: 'Satellite Indices',
    descEn: 'NDVI, EVI, NDMI from Sentinel-2 every 5 days. Monitor crop health from orbit.',
  },
  {
    icon: TrendingUp,
    titleUk: 'ML-прогноз урожаю',
    descUk: 'Машинне навчання оцінює врожайність з урахуванням погоди, ґрунту та стану культури.',
    titleEn: 'ML Yield Forecast',
    descEn: 'Machine learning predicts yield considering weather, soil type, and crop status.',
  },
  {
    icon: CloudRain,
    titleUk: 'Погода на 7 днів',
    descUk: 'Гіперлокальний прогноз прямо для вашого поля. Температура, опади, вологість.',
    titleEn: '7-Day Weather',
    descEn: 'Hyperlocal forecast directly for your field. Temperature, precipitation, humidity.',
  },
  {
    icon: Leaf,
    titleUk: "AI звіти здоров’я",
    descUk: 'Штучний інтелект аналізує стан полів і надає рекомендації агронома.',
    titleEn: 'AI Health Reports',
    descEn: 'Artificial intelligence analyses field health and provides agronomist recommendations.',
  },
  {
    icon: Map,
    titleUk: 'Малювання полів',
    descUk: 'Обведіть ваші поля прямо на карті. Площа обчислюється автоматично.',
    titleEn: 'Draw Fields',
    descEn: 'Draw your fields directly on the map. Area calculated automatically.',
  },
  {
    icon: BarChart3,
    titleUk: 'Аналітика портфоліо',
    descUk: 'Загальна площа, розподіл культур, порівняння врожайності між сезонами.',
    titleEn: 'Portfolio Analytics',
    descEn: 'Total area, crop distribution, yield comparison across seasons.',
  },
]

const stats = [
  { value: '5 днів', label: 'Оновлення даних', labelEn: 'Data refresh' },
  { value: '10 м', label: 'Роздільна здатність', labelEn: 'Resolution' },
  { value: '8+', label: 'Культур підтримується', labelEn: 'Supported crops' },
  { value: '99.9%', label: 'Доступність сервісу', labelEn: 'Uptime' },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-[#040a06] text-[#f0f4f1] overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 border-b border-[#1e3022]/60 bg-[#040a06]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4ade80] flex items-center justify-center">
            <Satellite size={16} className="text-[#040a06]" />
          </div>
          <span className="font-display font-bold text-xl text-[#f0f4f1] tracking-tight">Нива</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth/login"
            className="text-sm text-[#6b9e78] hover:text-[#f0f4f1] transition-colors font-medium"
          >
            Увійти
          </Link>
          <Link to="/auth/signup">
            <Button size="sm">Почати безкоштовно</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 topo-grid opacity-60" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#4ade80]/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#22c55e]/3 blur-3xl pointer-events-none" />

        {/* Floating satellite illustration */}
        <div className="absolute top-24 right-8 md:right-24 opacity-15 pointer-events-none">
          <div className="w-48 h-48 border border-[#4ade80]/30 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite]">
            <div className="w-32 h-32 border border-[#4ade80]/20 rounded-full flex items-center justify-center">
              <Satellite size={32} className="text-[#4ade80]" />
            </div>
          </div>
        </div>

        <div className="relative max-w-4xl text-center animate-fade-in">
          {/* Category pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2d4a34] bg-[#0d1a14] text-xs text-[#4ade80] font-mono uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            Agtech · Satellite Intelligence
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
            Супутниковий{' '}
            <span className="text-[#4ade80]">інтелект</span>
            <br />
            для ваших полів
          </h1>

          <p className="text-lg md:text-xl text-[#6b9e78] max-w-2xl mx-auto leading-relaxed mb-10">
            Нива об'єднує дані Sentinel-2, машинне навчання та штучний інтелект,
            щоб дати вам повну картину стану посівів — у реальному часі.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth/signup">
              <Button size="lg" icon={<ArrowRight size={20} />}>
                Почати безкоштовно
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">
                Увійти в кабінет
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e3022] rounded-xl overflow-hidden border border-[#1e3022] max-w-3xl w-full">
          {stats.map((s) => (
            <div key={s.value} className="bg-[#0a1410] px-6 py-5 text-center">
              <p className="font-display font-bold text-2xl text-[#4ade80]">{s.value}</p>
              <p className="text-xs text-[#6b9e78] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#4ade80] font-mono uppercase tracking-widest mb-4">Можливості</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#f0f4f1]">
            Всі інструменти агронома —<br />в одному місці
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="group relative bg-[#0d1a14] border border-[#1e3022] rounded-xl p-6 overflow-hidden
                  hover:border-[#2d4a34] transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-[#4ade80]/0 group-hover:bg-[#4ade80]/[0.02] transition-all duration-300 pointer-events-none" />

                <div className="w-10 h-10 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#4ade80]" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#f0f4f1] mb-2">{f.titleUk}</h3>
                <p className="text-sm text-[#6b9e78] leading-relaxed">{f.descUk}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center bg-[#0d1a14] border border-[#2d4a34] rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent pointer-events-none" />
          <Layers size={40} className="text-[#4ade80] mx-auto mb-5 opacity-80" />
          <h2 className="font-display font-bold text-3xl text-[#f0f4f1] mb-4">
            Готові до запуску?
          </h2>
          <p className="text-[#6b9e78] mb-8">
            Створіть безкоштовний акаунт і додайте своє перше поле за хвилину.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" icon={<ArrowRight size={20} />}>
              Зареєструватись безкоштовно
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e3022] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#4ade80] flex items-center justify-center">
            <Satellite size={12} className="text-[#040a06]" />
          </div>
          <span className="font-display font-bold text-[#f0f4f1]">Нива</span>
        </div>
        <p className="text-xs text-[#3d7050]">© 2025 Нива. Супутниковий інтелект для агросектору.</p>
      </footer>
    </div>
  )
}
