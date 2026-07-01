import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, MapPin, TrendingUp, ArrowRight, Plus, Activity, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { statsApi } from '@/api/stats'
import { fieldsApi } from '@/api/fields'
import type { StatsResponse, FieldResponse } from '@/types'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatArea, isStale } from '@/lib/utils'
import { NDVIChip } from '@/components/NDVIColorScale'
import { ndviToHex } from '@/lib/ndvi'
import { Sparkline } from '@/components/Sparkline'
import { CropIcon } from '@/components/CropIcon'
import { Onboarding } from '@/components/Onboarding'
import type { CropType } from '@/types'
import { toast } from 'react-toastify'

const CHART_COLORS = ['#16a34a', '#d97706', '#2563eb', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#64748b']

export function Overview() {
  const { t, i18n } = useTranslation()

  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [allFields, setAllFields] = useState<FieldResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, f] = await Promise.all([statsApi.get(), fieldsApi.list()])
        setStats(s)
        setAllFields(f)
      } catch {
        toast.error(t('overview.loadError'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  const fields = allFields.slice(0, 5)

  const ndviValues = allFields
    .map((f) => f.latest_ndvi)
    .filter((v): v is number => v != null)
  const avgNdvi = ndviValues.length
    ? ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length
    : null

  // fields that need a look: low vegetation or stale satellite data
  const attention = allFields
    .filter((f) => (f.latest_ndvi != null && f.latest_ndvi < 0.3) || isStale(f.ndvi_updated_at))
    .slice(0, 4)

  const statCards = [
    {
      label: t('stats.totalFields'),
      value: stats?.total_fields ?? 0,
      icon: Layers,
      hint: t('overview.fieldsHint'),
      color: 'text-[#16a34a]',
      bg: 'bg-[#f0fdf4]',
      border: 'border-[#bbf7d0]',
      valueColor: undefined as string | undefined,
    },
    {
      label: t('stats.totalArea'),
      value: formatArea(stats?.total_area_ha ?? 0, i18n.language),
      icon: MapPin,
      hint: t('overview.areaHint'),
      color: 'text-[#2563eb]',
      bg: 'bg-[#eff6ff]',
      border: 'border-[#bfdbfe]',
      valueColor: undefined as string | undefined,
    },
    {
      label: t('stats.crops'),
      value: stats?.crop_distribution.length ?? 0,
      icon: TrendingUp,
      hint: t('overview.cropsHint'),
      color: 'text-[#d97706]',
      bg: 'bg-[#fffbeb]',
      border: 'border-[#fde68a]',
      valueColor: undefined as string | undefined,
    },
    {
      label: t('overview.avgNdvi'),
      value: avgNdvi != null ? avgNdvi.toFixed(2) : '—',
      icon: Activity,
      hint: t('overview.avgNdviHint'),
      color: 'text-[#16a34a]',
      bg: 'bg-[#f0fdf4]',
      border: 'border-[#bbf7d0]',
      valueColor: avgNdvi != null ? ndviToHex(avgNdvi) : undefined,
    },
  ]

  const isEmpty = !loading && fields.length === 0 && (stats?.total_fields ?? 0) === 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl text-[#111827] tracking-tight">
            {t('overview.title')}
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {t('overview.subtitle')}
          </p>
        </div>
        {!isEmpty && (
          <Link to="/dashboard/map">
            <Button size="sm" icon={<Plus size={14} />}>
              {t('map.newField')}
            </Button>
          </Link>
        )}
      </div>

      {isEmpty && <Onboarding />}

      {!isEmpty && (
      <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, icon: Icon, hint, color, bg, border, valueColor }) => (
            <Card key={label}>
              <CardBody className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1">{label}</p>
                  <p
                    className="font-semibold text-xl sm:text-2xl tabular-nums text-[#111827] whitespace-nowrap"
                    style={valueColor ? { color: valueColor } : undefined}
                  >
                    {value}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-0.5">{hint}</p>
                </div>
              </CardBody>
            </Card>
          ))}
      </div>

      {/* Needs attention */}
      {!loading && attention.length > 0 && (
        <Card className="border-[#fde68a] bg-[#fffbeb]">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-[#d97706]" />
              <h2 className="font-semibold text-sm text-[#92400e]">
                {t('overview.attentionTitle')}
              </h2>
              <Badge variant="warning">{attention.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attention.map((f) => {
                const low = f.latest_ndvi != null && f.latest_ndvi < 0.3
                return (
                  <Link
                    key={f.id}
                    to={`/dashboard/fields/${f.id}`}
                    className="flex items-center gap-3 bg-white border border-[#fde68a] rounded-lg px-3 py-2 hover:border-[#d97706] transition-colors"
                  >
                    <CropIcon crop={f.crop_type} size={15} className="text-[#16a34a] shrink-0" />
                    <span className="font-medium text-sm text-[#111827] truncate flex-1">{f.name}</span>
                    <span className="text-[10px] font-medium text-[#92400e] bg-[#fef3c7] rounded px-1.5 py-0.5 shrink-0">
                      {low ? t('overview.reasonLow') : t('overview.reasonStale')}
                    </span>
                    {f.latest_ndvi != null && <NDVIChip value={f.latest_ndvi} className="shrink-0" />}
                  </Link>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-sm text-[#111827]">
              {t('overview.cropDistribution')}
            </h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Skeleton className="w-36 h-36 rounded-full" />
              </div>
            ) : !stats?.crop_distribution.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#9ca3af] text-sm">
                <Layers size={28} className="mb-3 opacity-40" />
                {t('overview.noDataYet')}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stats.crop_distribution}
                      dataKey="count"
                      nameKey="crop"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {stats.crop_distribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#111827',
                        boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
                      }}
                      formatter={(val: number, name: string) => [
                        val,
                        t(`crops.${name}`, { defaultValue: name }),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-1 space-y-1.5">
                  {stats.crop_distribution.map((item, i) => (
                    <div key={item.crop} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[#6b7280] flex-1 inline-flex items-center gap-1.5">
                        <CropIcon crop={item.crop as CropType} size={13} className="text-[#6b7280]" />
                        {t(`crops.${item.crop}`, { defaultValue: item.crop })}
                      </span>
                      <Badge variant="neutral">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Recent fields */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-sm text-[#111827]">
              {t('overview.recentFields')}
            </h2>
            <Link
              to="/dashboard/fields"
              className="text-xs text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 transition-colors font-medium"
            >
              {t('overview.allFields')} <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={52} className="rounded-lg" />
                ))}
              </div>
            ) : !fields.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#9ca3af]">
                <MapPin size={28} className="mb-3 opacity-30" />
                <p className="text-sm mb-3">{t('fields.noFields')}</p>
                <Link to="/dashboard/map">
                  <Button size="sm" variant="secondary" icon={<Plus size={13} />}>
                    {t('fields.addFirst')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#f3f4f6]">
                {fields.map((field) => (
                  <Link
                    key={field.id}
                    to={`/dashboard/fields/${field.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[#fafafa] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center shrink-0">
                      <CropIcon crop={field.crop_type} size={15} className="text-[#16a34a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#111827] truncate">{field.name}</p>
                      <p className="text-xs text-[#9ca3af]">
                        {t(`crops.${field.crop_type}`, { defaultValue: field.crop_type })}
                      </p>
                    </div>
                    {field.ndvi_trend.length >= 2 && (
                      <Sparkline
                        values={field.ndvi_trend}
                        width={64}
                        height={22}
                        color={isStale(field.ndvi_updated_at) ? '#d97706' : '#16a34a'}
                        className="shrink-0 hidden sm:block"
                      />
                    )}
                    {field.latest_ndvi != null && (
                      <NDVIChip value={field.latest_ndvi} className="shrink-0" />
                    )}
                    <span className="text-sm font-medium text-[#16a34a] tabular-nums shrink-0">
                      {formatArea(field.area_ha, i18n.language)}
                    </span>
                    <ArrowRight size={13} className="text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      </>
      )}
    </div>
  )
}
