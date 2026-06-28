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
    titleUk: "AI звіти здоров'я",
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
  { value: '5 днів', label: 'Оновлення даних' },
  { value: '10 м', label: 'Роздільна здатність' },
  { value: '8+', label: 'Культур підтримується' },
  { value: '99.9%', label: 'Доступність' },
]

export function Landing() {
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
            Увійти
          </Link>
          <Link to="/auth/signup">
            <Button size="sm">Почати безкоштовно</Button>
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
          Супутниковий інтелект<br />
          <span className="text-[#16a34a]">для ваших полів</span>
        </h1>

        <p className="text-lg text-[#6b7280] max-w-xl mx-auto leading-relaxed mb-9">
          Нива об'єднує дані Sentinel-2, машинне навчання та штучний інтелект,
          щоб дати вам повну картину стану посівів.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/auth/signup">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              Почати безкоштовно
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg">
              Увійти в кабінет
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
          <p className="text-xs text-[#16a34a] font-semibold uppercase tracking-widest mb-3">Можливості</p>
          <h2 className="font-semibold text-2xl md:text-3xl text-[#111827] tracking-tight">
            Всі інструменти агронома — в одному місці
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
                <h3 className="font-semibold text-sm text-[#111827] mb-1.5">{f.titleUk}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.descUk}</p>
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
            Готові до запуску?
          </h2>
          <p className="text-[#6b7280] text-sm mb-6">
            Створіть безкоштовний акаунт і додайте своє перше поле за хвилину.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              Зареєструватись безкоштовно
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
        <p className="text-xs text-[#9ca3af]">© 2025 Нива. Супутниковий інтелект для агросектору.</p>
      </footer>
    </div>
  )
}
