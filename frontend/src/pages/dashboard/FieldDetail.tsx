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
import { CropIcon } from '@/components/CropIcon'
import { Tooltip } from '@/components/ui/Tooltip'
import {
  formatArea, formatDate, isStale, formatRelativeTime,
} from '@/lib/utils'
import { getApiErrorMessage } from '@/lib/apiErrors'

// ── Inline stale / freshness label ───────────────────────────────────────────
function NdviTimestamp({ updatedAt }: { updatedAt: string | null }) {
  const { t, i18n } = useTranslation()
  if (!updatedAt) return null
  const stale = isStale(updatedAt)
  const rel = formatRelativeTime(updatedAt, i18n.language)

  if (stale) {
    return (
      <Tooltip content={t('fieldDetail.satelliteStale')}>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#d97706] font-medium cursor-help">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
          {t('fields.stale')}
          <span className="text-[#9ca3af] font-normal">· {rel}</span>
        </span>
      </Tooltip>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#9ca3af]">
      <Clock size={10} className="shrink-0" />
      {t('fields.updatedAgo', { rel })}
    </span>
  )
}

export function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

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
  const [predictError, setPredictError] = useState<string | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [showEvi,  setShowEvi]  = useState(false)
  const [showNdmi, setShowNdmi] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const f = await fieldsApi.get(id)
      setField(f)
    } catch {
      toast.error(t('fieldDetail.notFound'))
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
  }, [id, t, navigate])

  useEffect(() => { loadData() }, [loadData])

  const handlePredict = async () => {
    if (!id) return
    setPredictingYield(true)
    setPredictError(null)
    try {
      setPredict(await insightsApi.predict(id))
    } catch (error) {
      const message = getApiErrorMessage(error, t, t('fieldDetail.predictionFailed'))
      setPredictError(message)
      toast.error(message)
    } finally {
      setPredictingYield(false)
    }
  }

  const handleReport = async () => {
    if (!id) return
    setGeneratingReport(true)
    setReportError(null)
    try {
      setReport(await insightsApi.report(id))
    } catch (error) {
      const message = getApiErrorMessage(error, t, t('fieldDetail.reportFailed'))
      setReportError(message)
      toast.error(message)
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
                  <span className="inline-flex items-center gap-1.5">
                    {field && <CropIcon crop={field.crop_type} size={12} />}
                    {field && t(`crops.${field.crop_type}`, { defaultValue: field.crop_type })}
                  </span>
                </Badge>
                <Badge variant="neutral">
                  {field && t(`soils.${field.soil_type}`, { defaultValue: field.soil_type })}
                </Badge>
                <span className="text-sm font-semibold text-[#16a34a] tabular-nums">
                  {formatArea(field?.area_ha ?? 0, i18n.language)}
                </span>
              </div>
            </>
          )}
        </div>
        <Link to={`/dashboard/map/${id}`}>
          <Button size="sm" variant="outline" icon={<Pencil size={13} />}>
            {t('common.edit')}
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
                {t('fieldDetail.vegetationIndices')}
              </h2>
              {/* source + freshness */}
              {indices && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs text-[#9ca3af]">{indices.source}</span>
                  <span className="text-[#e5e7eb]">·</span>
                  <NdviTimestamp updatedAt={field?.ndvi_updated_at ?? null} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {latestNdvi && (
                <Tooltip content={t('fieldDetail.ndviTooltip')}>
                  <span><NDVIChip value={latestNdvi.ndvi} /></span>
                </Tooltip>
              )}
              <Tooltip content={t('fieldDetail.eviTooltip')}>
                <button
                  onClick={() => setShowEvi(!showEvi)}
                  aria-pressed={showEvi}
                  aria-label={`EVI ${showEvi ? t('fieldDetail.hide') : t('fieldDetail.show')}`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                    showEvi
                      ? 'text-[#2563eb] bg-[#eff6ff] border-[#bfdbfe]'
                      : 'text-[#9ca3af] bg-white border-[#e5e7eb] hover:border-[#d1d5db]'
                  }`}
                >
                  {showEvi ? <Eye size={11} /> : <EyeOff size={11} />} EVI
                </button>
              </Tooltip>
              <Tooltip content={t('fieldDetail.ndmiTooltip')}>
                <button
                  onClick={() => setShowNdmi(!showNdmi)}
                  aria-pressed={showNdmi}
                  aria-label={`NDMI ${showNdmi ? t('fieldDetail.hide') : t('fieldDetail.show')}`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                    showNdmi
                      ? 'text-[#d97706] bg-[#fffbeb] border-[#fde68a]'
                      : 'text-[#9ca3af] bg-white border-[#e5e7eb] hover:border-[#d1d5db]'
                  }`}
                >
                  {showNdmi ? <Eye size={11} /> : <EyeOff size={11} />} NDMI
                </button>
              </Tooltip>
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
                {t('weather.title')}
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
                    <p className="text-xs text-[#9ca3af]">{t('weather.humidity')}</p>
                    <p className="text-sm font-semibold text-[#374151] tabular-nums">
                      {weather.current.humidity}%
                    </p>
                  </div>
                </div>
                <WeatherChart data={weather.forecast.slice(0, 7)} height={180} />
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-[#9ca3af] text-sm">
                {t('fieldDetail.dataUnavailable')}
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
                  {t('predict.title')}
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
                        {t('fieldDetail.expectedYield')}
                      </p>
                      <p className="font-semibold tabular-nums leading-none">
                        <span className="text-[2rem] text-[#111827]">
                          {predict.yield_t_ha.toFixed(2)}
                        </span>
                        <span className="text-sm text-[#9ca3af] ml-1.5">
                          {t('predict.unit')}
                        </span>
                      </p>
                    </div>
                    <ConfidenceBadge confidence={predict.confidence} />
                  </div>
                  {predict.features_filled_from_baseline > 0 && (
                    <p className="text-xs text-[#d97706] flex items-center gap-1.5">
                      <AlertTriangle size={11} className="shrink-0" />
                      {t('fieldDetail.baselineFilled')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {t('fieldDetail.yieldPrompt')}
                </p>
              )}
              {predictError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs leading-relaxed text-[#991b1b]">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>{predictError}</span>
                </div>
              )}
              <Tooltip content={t('fieldDetail.predictTooltip')}>
                <Button
                  variant={predict ? 'secondary' : 'primary'}
                  onClick={handlePredict}
                  loading={predictingYield}
                  icon={<TrendingUp size={15} />}
                  className="w-full"
                >
                  {predict ? t('fieldDetail.refreshForecast') : t('predict.action')}
                </Button>
              </Tooltip>
            </CardBody>
          </Card>

          {/* AI health report */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#7c3aed]" />
                <h2 className="font-semibold text-sm text-[#111827]">
                  {t('report.title')}
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
                        {t('fieldDetail.cropHealth')}
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
                        {t('report.risks')}
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
                        {t('report.recommendations')}
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
                  {t('fieldDetail.reportPrompt')}
                </p>
              )}
              {reportError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs leading-relaxed text-[#991b1b]">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>{reportError}</span>
                </div>
              )}
              <Tooltip content={t('fieldDetail.aiTooltip')}>
                <Button
                  variant={report ? 'secondary' : 'primary'}
                  onClick={handleReport}
                  loading={generatingReport}
                  icon={<FileText size={15} />}
                  className="w-full"
                >
                  {report ? t('fieldDetail.refreshReport') : t('report.action')}
                </Button>
              </Tooltip>
            </CardBody>
          </Card>

        </div>
      </div>

      {/* ── Field metadata ── */}
      {field && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-[#111827]">
              {t('fieldDetail.fieldDetails')}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: t('fields.name'),    value: field.name },
                {
                  label: t('fields.area'),
                  value: formatArea(field.area_ha, i18n.language),
                  mono: true, accent: true,
                },
                {
                  label: t('fields.crop'),
                  value: t(`crops.${field.crop_type}`, { defaultValue: field.crop_type }),
                },
                {
                  label: t('fields.soil_label'),
                  value: t(`soils.${field.soil_type}`, { defaultValue: field.soil_type }),
                },
                { label: 'ID',                       value: field.id,    mono: true },
                {
                  label: t('fields.createdAt'),
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
