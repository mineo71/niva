import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Satellite, CloudRain, TrendingUp, FileText,
  AlertTriangle, CheckCircle, Lightbulb, Pencil, Eye, EyeOff, Clock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fieldsApi } from '@/api/fields'
import { insightsApi } from '@/api/insights'
import type { FieldResponse, IndicesResponse, WeatherResponse, PredictResponse, ReportResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { HealthBadge } from '@/components/HealthBadge'
import { ConfidenceBadge } from '@/components/ConfidenceBadge'
import { NDVIChart } from '@/components/charts/NDVIChart'
import { WeatherChart } from '@/components/charts/WeatherChart'
import { NDVIColorScale, NDVIChip } from '@/components/NDVIColorScale'
import {
  formatArea, formatDate, isStale, formatRelativeTime,
  CROP_LABELS_UK, CROP_LABELS_EN, CROP_ICONS,
  SOIL_LABELS_UK, SOIL_LABELS_EN,
} from '@/lib/utils'

// ── Inline stale / freshness label (same as Fields.tsx) ──────────────────────
function NdviTimestamp({
  updatedAt,
  lang,
}: {
  updatedAt: string | null
  lang: 'uk' | 'en'
}) {
  if (!updatedAt) return null
  const stale = isStale(updatedAt)
  const rel   = formatRelativeTime(updatedAt, lang)

  if (stale) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#d97706] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
        {lang === 'uk' ? 'застаріло' : 'stale'}
        <span className="text-[#9ca3af] font-normal">· {rel}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#9ca3af]">
      <Clock size={10} className="shrink-0" />
      {lang === 'uk' ? `оновлено ${rel}` : `updated ${rel}`}
    </span>
  )
}

export function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isUk = i18n.language === 'uk'
  const lang  = i18n.language as 'uk' | 'en'

  const [field, setField]     = useState<FieldResponse | null>(null)
  const [indices, setIndices] = useState<IndicesResponse | null>(null)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [predict, setPredict] = useState<PredictResponse | null>(null)
  const [report, setReport]   = useState<ReportResponse | null>(null)

  const [loadingField,   setLoadingField]   = useState(true)
  const [loadingIndices, setLoadingIndices] = useState(true)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [predictingYield,   setPredictingYield]   = useState(false)
  const [generatingReport,  setGeneratingReport]  = useState(false)
  const [showEvi,  setShowEvi]  = useState(false)
  const [showNdmi, setShowNdmi] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const f = await fieldsApi.get(id)
      setField(f)
    } catch {
      toast.error(isUk ? 'Поле не знайдено' : 'Field not found')
      navigate('/dashboard/fields')
    } finally {
      setLoadingField(false)
    }
    try {
      const idx = await insightsApi.indices(id)
      setIndices(idx)
    } catch { /* non-critical */ }
    finally { setLoadingIndices(false) }

    try {
      const w = await insightsApi.weather(id)
      setWeather(w)
    } catch { /* non-critical */ }
    finally { setLoadingWeather(false) }
  }, [id, isUk, navigate])

  useEffect(() => { loadData() }, [loadData])

  const handlePredict = async () => {
    if (!id) return
    setPredictingYield(true)
    try {
      setPredict(await insightsApi.predict(id))
    } catch {
      toast.error(isUk ? 'Помилка прогнозування' : 'Prediction failed')
    } finally {
      setPredictingYield(false)
    }
  }

  const handleReport = async () => {
    if (!id) return
    setGeneratingReport(true)
    try {
      setReport(await insightsApi.report(id))
    } catch {
      toast.error(isUk ? 'Помилка генерації звіту' : 'Report generation failed')
    } finally {
      setGeneratingReport(false)
    }
  }

  const latestNdvi = indices?.series[indices.series.length - 1]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/fields"
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          {loadingField ? (
            <Skeleton height={24} className="w-48 mb-1" />
          ) : (
            <>
              <h1 className="font-semibold text-xl text-[#111827] tracking-tight truncate">
                {field?.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="neutral">
                  {CROP_ICONS[field?.crop_type as keyof typeof CROP_ICONS]}{' '}
                  {isUk
                    ? CROP_LABELS_UK[field?.crop_type as keyof typeof CROP_LABELS_UK]
                    : CROP_LABELS_EN[field?.crop_type as keyof typeof CROP_LABELS_EN]}
                </Badge>
                <Badge variant="neutral">
                  {isUk
                    ? SOIL_LABELS_UK[field?.soil_type as keyof typeof SOIL_LABELS_UK]
                    : SOIL_LABELS_EN[field?.soil_type as keyof typeof SOIL_LABELS_EN]}
                </Badge>
                <span className="text-sm font-semibold text-[#16a34a] tabular-nums">
                  {formatArea(field?.area_ha ?? 0)}
                </span>
              </div>
            </>
          )}
        </div>
        <Link to={`/dashboard/map/${id}`}>
          <Button size="sm" variant="outline" icon={<Pencil size={13} />}>
            {isUk ? 'Редагувати' : 'Edit'}
          </Button>
        </Link>
      </div>

      {/* ── Vegetation indices chart ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Satellite size={16} className="text-[#16a34a] shrink-0" />
              <h2 className="font-semibold text-sm text-[#111827]">
                {isUk ? 'Вегетаційні індекси' : 'Vegetation Indices'}
              </h2>
              {/* source + freshness */}
              {indices && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs text-[#9ca3af]">{indices.source}</span>
                  <span className="text-[#e5e7eb]">·</span>
                  <NdviTimestamp updatedAt={field?.ndvi_updated_at ?? null} lang={lang} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {latestNdvi && <NDVIChip value={latestNdvi.ndvi} />}
              <button
                onClick={() => setShowEvi(!showEvi)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                  showEvi
                    ? 'text-[#2563eb] bg-[#eff6ff] border-[#bfdbfe]'
                    : 'text-[#9ca3af] bg-white border-[#e5e7eb] hover:border-[#d1d5db]'
                }`}
              >
                {showEvi ? <Eye size={11} /> : <EyeOff size={11} />} EVI
              </button>
              <button
                onClick={() => setShowNdmi(!showNdmi)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                  showNdmi
                    ? 'text-[#d97706] bg-[#fffbeb] border-[#fde68a]'
                    : 'text-[#9ca3af] bg-white border-[#e5e7eb] hover:border-[#d1d5db]'
                }`}
              >
                {showNdmi ? <Eye size={11} /> : <EyeOff size={11} />} NDMI
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loadingIndices ? (
            <Skeleton height={260} className="rounded-lg" />
          ) : (
            <>
              <NDVIChart data={indices?.series ?? []} showEvi={showEvi} showNdmi={showNdmi} />
              <div className="mt-4">
                <NDVIColorScale showLabels />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* ── Weather + ML actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Weather */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CloudRain size={16} className="text-[#2563eb]" />
              <h2 className="font-semibold text-sm text-[#111827]">
                {isUk ? 'Погода' : 'Weather'}
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {loadingWeather ? (
              <>
                <Skeleton height={60} className="rounded-xl" />
                <Skeleton height={180} className="rounded-lg" />
              </>
            ) : weather ? (
              <>
                <div className="flex items-center gap-4 bg-[#fffbeb] rounded-xl px-4 py-3 border border-[#fde68a]">
                  <div>
                    <p className="font-semibold text-3xl text-[#d97706] tabular-nums">
                      {weather.current.temp_c.toFixed(1)}°
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5 capitalize">
                      {weather.current.description}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-[#9ca3af]">{isUk ? 'Вологість' : 'Humidity'}</p>
                    <p className="text-sm font-semibold text-[#374151] tabular-nums">
                      {weather.current.humidity}%
                    </p>
                  </div>
                </div>
                <WeatherChart data={weather.forecast.slice(0, 7)} height={180} />
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-[#9ca3af] text-sm">
                {isUk ? 'Дані недоступні' : 'Data unavailable'}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ML cards column */}
        <div className="space-y-4">

          {/* Yield forecast */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#d97706]" />
                <h2 className="font-semibold text-sm text-[#111827]">
                  {isUk ? 'Прогноз врожаю' : 'Yield Forecast'}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {predict ? (
                <div className="space-y-3">
                  {/* Prominent number block */}
                  <div className="bg-[#f9fafb] rounded-xl px-4 py-3.5 border border-[#f3f4f6] flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-1">
                        {isUk ? 'Очікувана врожайність' : 'Expected yield'}
                      </p>
                      <p className="font-semibold tabular-nums leading-none">
                        <span className="text-[2rem] text-[#111827]">
                          {predict.yield_t_ha.toFixed(2)}
                        </span>
                        <span className="text-sm text-[#9ca3af] ml-1.5">
                          {isUk ? 'т/га' : 't/ha'}
                        </span>
                      </p>
                    </div>
                    <ConfidenceBadge confidence={predict.confidence} />
                  </div>
                  {predict.features_filled_from_baseline > 0 && (
                    <p className="text-xs text-[#d97706] flex items-center gap-1.5">
                      <AlertTriangle size={11} className="shrink-0" />
                      {isUk
                        ? 'Частина даних взята з базових значень'
                        : 'Some data filled from baseline'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {isUk
                    ? 'Отримайте ML-прогноз врожайності на основі супутникових та погодних даних.'
                    : 'Get ML yield prediction based on satellite and weather data.'}
                </p>
              )}
              <Button
                variant={predict ? 'secondary' : 'primary'}
                onClick={handlePredict}
                loading={predictingYield}
                icon={<TrendingUp size={15} />}
                className="w-full"
              >
                {predict
                  ? isUk ? 'Оновити прогноз' : 'Refresh forecast'
                  : isUk ? 'Прогнозувати врожай' : 'Predict yield'}
              </Button>
            </CardBody>
          </Card>

          {/* AI health report */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#7c3aed]" />
                <h2 className="font-semibold text-sm text-[#111827]">
                  {isUk ? "AI Звіт здоров'я" : 'AI Health Report'}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {generatingReport ? (
                <SkeletonText lines={4} />
              ) : report ? (
                <div className="space-y-3">
                  {/* Health status hero */}
                  <div className="flex items-center gap-3 bg-[#f9fafb] rounded-xl px-4 py-3 border border-[#f3f4f6]">
                    <HealthBadge health={report.health} size="lg" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-0.5">
                        {isUk ? 'Стан рослинності' : 'Crop health'}
                      </p>
                      <p className="text-xs text-[#374151] leading-snug line-clamp-2">
                        {report.summary}
                      </p>
                    </div>
                  </div>

                  {/* Full summary if it's longer */}
                  <p className="text-sm text-[#374151] leading-relaxed">
                    {report.summary}
                  </p>

                  {report.risks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-[#dc2626] uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {isUk ? 'Ризики' : 'Risks'}
                      </p>
                      <ul className="space-y-1">
                        {report.risks.map((risk, i) => (
                          <li key={i} className="text-xs text-[#6b7280] flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#dc2626] shrink-0 mt-1.5" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.recommendations.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-[#16a34a] uppercase tracking-wide flex items-center gap-1">
                        <Lightbulb size={10} />
                        {isUk ? 'Рекомендації' : 'Recommendations'}
                      </p>
                      <ul className="space-y-1">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-[#6b7280] flex items-start gap-2">
                            <CheckCircle size={11} className="text-[#16a34a] shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {isUk
                    ? 'Генеруйте детальний AI-звіт про стан рослинності та рекомендації.'
                    : 'Generate a detailed AI report on crop health and recommendations.'}
                </p>
              )}
              <Button
                variant={report ? 'secondary' : 'primary'}
                onClick={handleReport}
                loading={generatingReport}
                icon={<FileText size={15} />}
                className="w-full"
              >
                {report
                  ? isUk ? 'Оновити звіт' : 'Refresh report'
                  : isUk ? 'Генерувати AI звіт' : 'Generate AI report'}
              </Button>
            </CardBody>
          </Card>

        </div>
      </div>

      {/* ── Field metadata ── */}
      {field && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Деталі поля' : 'Field Details'}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: isUk ? 'Назва' : 'Name',    value: field.name },
                {
                  label: isUk ? 'Площа' : 'Area',
                  value: formatArea(field.area_ha),
                  mono: true, accent: true,
                },
                {
                  label: isUk ? 'Культура' : 'Crop',
                  value: isUk
                    ? CROP_LABELS_UK[field.crop_type as keyof typeof CROP_LABELS_UK]
                    : CROP_LABELS_EN[field.crop_type as keyof typeof CROP_LABELS_EN],
                },
                {
                  label: isUk ? 'Ґрунт' : 'Soil',
                  value: isUk
                    ? SOIL_LABELS_UK[field.soil_type as keyof typeof SOIL_LABELS_UK]
                    : SOIL_LABELS_EN[field.soil_type as keyof typeof SOIL_LABELS_EN],
                },
                { label: 'ID',                       value: field.id,    mono: true },
                {
                  label: isUk ? 'Створено' : 'Created',
                  value: formatDate(field.created_at, i18n.language),
                },
              ].map(({ label, value, mono, accent }) => (
                <div key={label} className="bg-[#f9fafb] rounded-lg px-3 py-2.5 border border-[#f3f4f6]">
                  <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className={`text-sm truncate font-medium ${mono ? 'tabular-nums' : ''} ${accent ? 'text-[#16a34a]' : 'text-[#111827]'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

    </div>
  )
}
