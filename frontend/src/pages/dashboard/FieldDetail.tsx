import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Satellite, CloudRain, TrendingUp, FileText,
  AlertTriangle, CheckCircle, Lightbulb, Pencil, Eye, EyeOff,
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
import { formatArea, formatDate, CROP_LABELS_UK, CROP_LABELS_EN, CROP_ICONS, SOIL_LABELS_UK, SOIL_LABELS_EN } from '@/lib/utils'

export function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isUk = i18n.language === 'uk'

  const [field, setField] = useState<FieldResponse | null>(null)
  const [indices, setIndices] = useState<IndicesResponse | null>(null)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [predict, setPredict] = useState<PredictResponse | null>(null)
  const [report, setReport] = useState<ReportResponse | null>(null)

  const [loadingField, setLoadingField] = useState(true)
  const [loadingIndices, setLoadingIndices] = useState(true)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [predictingYield, setPredictingYield] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  const [showEvi, setShowEvi] = useState(false)
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
      const result = await insightsApi.predict(id)
      setPredict(result)
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
      const result = await insightsApi.report(id)
      setReport(result)
    } catch {
      toast.error(isUk ? 'Помилка генерації звіту' : 'Report generation failed')
    } finally {
      setGeneratingReport(false)
    }
  }

  const latestNdvi = indices?.series[indices.series.length - 1]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/fields" className="p-2 rounded-lg text-[#6b9e78] hover:text-[#f0f4f1] hover:bg-[#112018] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          {loadingField ? (
            <Skeleton height={28} className="w-48 mb-1" />
          ) : (
            <>
              <h1 className="font-display font-bold text-2xl text-[#f0f4f1] truncate">{field?.name}</h1>
              <div className="flex items-center gap-2 mt-1">
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
                <span className="text-sm font-mono text-[#4ade80]">{formatArea(field?.area_ha ?? 0)}</span>
              </div>
            </>
          )}
        </div>
        <Link to={`/dashboard/map/${id}`}>
          <Button size="sm" variant="secondary" icon={<Pencil size={14} />}>
            {isUk ? 'Редагувати' : 'Edit'}
          </Button>
        </Link>
      </div>

      {/* NDVI Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Satellite size={18} className="text-[#4ade80]" />
              <h2 className="font-display font-semibold text-[#f0f4f1]">
                {isUk ? 'Вегетаційні індекси' : 'Vegetation Indices'}
              </h2>
              {indices && (
                <span className="text-xs text-[#6b9e78] font-mono">{indices.source}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {latestNdvi && <NDVIChip value={latestNdvi.ndvi} />}
              <button
                onClick={() => setShowEvi(!showEvi)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${showEvi ? 'text-[#60a5fa] bg-[#60a5fa]/10' : 'text-[#6b9e78] hover:text-[#f0f4f1]'}`}
              >
                {showEvi ? <Eye size={12} /> : <EyeOff size={12} />} EVI
              </button>
              <button
                onClick={() => setShowNdmi(!showNdmi)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${showNdmi ? 'text-[#f59e0b] bg-[#f59e0b]/10' : 'text-[#6b9e78] hover:text-[#f0f4f1]'}`}
              >
                {showNdmi ? <Eye size={12} /> : <EyeOff size={12} />} NDMI
              </button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loadingIndices ? (
            <Skeleton height={260} className="rounded-lg" />
          ) : (
            <>
              <NDVIChart
                data={indices?.series ?? []}
                showEvi={showEvi}
                showNdmi={showNdmi}
              />
              <div className="mt-4">
                <NDVIColorScale showLabels />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Weather + Actions row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weather */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CloudRain size={18} className="text-[#60a5fa]" />
              <h2 className="font-display font-semibold text-[#f0f4f1]">
                {isUk ? 'Погода' : 'Weather'}
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {loadingWeather ? (
              <>
                <Skeleton height={64} className="rounded-lg" />
                <Skeleton height={200} className="rounded-lg" />
              </>
            ) : weather ? (
              <>
                {/* Current weather */}
                <div className="flex items-center gap-4 bg-[#0a1410] rounded-xl px-4 py-3 border border-[#1e3022]">
                  <div>
                    <p className="font-display font-bold text-4xl text-[#f59e0b]">
                      {weather.current.temp_c.toFixed(1)}°
                    </p>
                    <p className="text-xs text-[#6b9e78] mt-0.5 capitalize">{weather.current.description}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-[#6b9e78]">{isUk ? 'Вологість' : 'Humidity'}</p>
                    <p className="text-sm font-mono text-[#f0f4f1]">{weather.current.humidity}%</p>
                  </div>
                </div>
                {/* Forecast chart */}
                <WeatherChart data={weather.forecast.slice(0, 7)} height={180} />
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-[#6b9e78] text-sm">
                {isUk ? 'Дані недоступні' : 'Data unavailable'}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ML Actions */}
        <div className="space-y-5">
          {/* Yield prediction */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[#f59e0b]" />
                <h2 className="font-display font-semibold text-[#f0f4f1]">
                  {isUk ? 'Прогноз врожаю' : 'Yield Forecast'}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {predict ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-3">
                    <div>
                      <p className="text-xs text-[#6b9e78] mb-1">{isUk ? 'Прогноз' : 'Forecast'}</p>
                      <p className="font-display font-bold text-4xl text-[#f0f4f1]">
                        {predict.yield_t_ha.toFixed(2)}
                        <span className="text-lg text-[#6b9e78] ml-1">т/га</span>
                      </p>
                    </div>
                    <ConfidenceBadge confidence={predict.confidence} />
                  </div>
                  {predict.features_filled_from_baseline && (
                    <p className="text-xs text-[#f59e0b] flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {isUk
                        ? 'Частина даних взята з базових значень'
                        : 'Some data filled from baseline'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6b9e78]">
                  {isUk
                    ? 'Отримайте ML-прогноз врожайності на основі супутникових та погодних даних.'
                    : 'Get ML yield prediction based on satellite and weather data.'}
                </p>
              )}
              <Button
                variant={predict ? 'secondary' : 'primary'}
                onClick={handlePredict}
                loading={predictingYield}
                icon={<TrendingUp size={16} />}
                className="w-full"
              >
                {predict
                  ? isUk ? 'Оновити прогноз' : 'Refresh forecast'
                  : isUk ? 'Прогнозувати врожай' : 'Predict yield'}
              </Button>
            </CardBody>
          </Card>

          {/* AI Health Report */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#a78bfa]" />
                <h2 className="font-display font-semibold text-[#f0f4f1]">
                  {isUk ? "AI Звіт здоров’я" : 'AI Health Report'}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {generatingReport ? (
                <SkeletonText lines={4} />
              ) : report ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <HealthBadge health={report.health} size="lg" />
                  </div>
                  <p className="text-sm text-[#f0f4f1] leading-relaxed">{report.summary}</p>

                  {report.risks.length > 0 && (
                    <div>
                      <p className="text-xs text-[#ef4444] font-display font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle size={12} /> {isUk ? 'Ризики' : 'Risks'}
                      </p>
                      <ul className="space-y-1">
                        {report.risks.map((risk, i) => (
                          <li key={i} className="text-xs text-[#6b9e78] flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#ef4444] shrink-0 mt-1.5" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs text-[#4ade80] font-display font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Lightbulb size={12} /> {isUk ? 'Рекомендації' : 'Recommendations'}
                      </p>
                      <ul className="space-y-1">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-[#6b9e78] flex items-start gap-2">
                            <CheckCircle size={12} className="text-[#4ade80] shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6b9e78]">
                  {isUk
                    ? 'Генеруйте детальний AI-звіт про стан рослинності та рекомендації.'
                    : 'Generate a detailed AI report on crop health and recommendations.'}
                </p>
              )}
              <Button
                variant={report ? 'secondary' : 'primary'}
                onClick={handleReport}
                loading={generatingReport}
                icon={<FileText size={16} />}
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

      {/* Field metadata */}
      {field && (
        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold text-[#f0f4f1]">
              {isUk ? 'Деталі поля' : 'Field Details'}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: isUk ? 'Назва' : 'Name', value: field.name },
                { label: isUk ? 'Площа' : 'Area', value: formatArea(field.area_ha), mono: true, accent: true },
                { label: isUk ? 'Культура' : 'Crop', value: isUk ? CROP_LABELS_UK[field.crop_type as keyof typeof CROP_LABELS_UK] : CROP_LABELS_EN[field.crop_type as keyof typeof CROP_LABELS_EN] },
                { label: isUk ? 'Ґрунт' : 'Soil', value: isUk ? SOIL_LABELS_UK[field.soil_type as keyof typeof SOIL_LABELS_UK] : SOIL_LABELS_EN[field.soil_type as keyof typeof SOIL_LABELS_EN] },
                { label: isUk ? 'ID' : 'ID', value: field.id, mono: true },
                { label: isUk ? 'Створено' : 'Created', value: formatDate(field.created_at, i18n.language) },
              ].map(({ label, value, mono, accent }) => (
                <div key={label} className="bg-[#0a1410] rounded-lg px-3 py-2.5 border border-[#1e3022]">
                  <p className="text-[10px] text-[#6b9e78] uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-sm truncate ${mono ? 'font-mono' : 'font-medium'} ${accent ? 'text-[#4ade80]' : 'text-[#f0f4f1]'}`}>
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
