import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, MapPin, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { statsApi } from '@/api/stats'
import { fieldsApi } from '@/api/fields'
import type { StatsResponse, FieldResponse } from '@/types'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatArea, CROP_LABELS_UK, CROP_LABELS_EN } from '@/lib/utils'
import { NDVIChip } from '@/components/NDVIColorScale'
import { CropIcon } from '@/components/CropIcon'
import type { CropType } from '@/types'
import { toast } from 'react-toastify'

const CHART_COLORS = ['#16a34a', '#d97706', '#2563eb', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#64748b']

export function Overview() {
  const { i18n } = useTranslation()
  const isUk = i18n.language === 'uk'

  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [fields, setFields] = useState<FieldResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, f] = await Promise.all([statsApi.get(), fieldsApi.list()])
        setStats(s)
        setFields(f.slice(0, 5))
      } catch {
        toast.error(isUk ? 'Помилка завантаження даних' : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isUk])

  const statCards = [
    {
      label: isUk ? 'Полів' : 'Fields',
      value: stats?.total_fields ?? 0,
      icon: Layers,
      hint: isUk ? 'Загалом на вашому акаунті' : 'Total in your account',
      color: 'text-[#16a34a]',
      bg: 'bg-[#f0fdf4]',
      border: 'border-[#bbf7d0]',
    },
    {
      label: isUk ? 'Загальна площа' : 'Total area',
      value: formatArea(stats?.total_area_ha ?? 0),
      icon: MapPin,
      hint: isUk ? 'Усі поля разом' : 'All fields combined',
      color: 'text-[#2563eb]',
      bg: 'bg-[#eff6ff]',
      border: 'border-[#bfdbfe]',
    },
    {
      label: isUk ? 'Культур' : 'Crops',
      value: stats?.crop_distribution.length ?? 0,
      icon: TrendingUp,
      hint: isUk ? 'Різних типів культур' : 'Different crop types',
      color: 'text-[#d97706]',
      bg: 'bg-[#fffbeb]',
      border: 'border-[#fde68a]',
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl text-[#111827] tracking-tight">
            {isUk ? 'Огляд' : 'Overview'}
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {isUk ? 'Стан вашого агропортфоліо' : 'Your agricultural portfolio status'}
          </p>
        </div>
        <Link to="/dashboard/map">
          <Button size="sm" icon={<Plus size={14} />}>
            {isUk ? 'Нове поле' : 'New field'}
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, icon: Icon, hint, color, bg, border }) => (
            <Card key={label}>
              <CardBody className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1">{label}</p>
                  <p className="font-semibold text-2xl text-[#111827] tabular-nums">{value}</p>
                  <p className="text-xs text-[#9ca3af] mt-0.5">{hint}</p>
                </div>
              </CardBody>
            </Card>
          ))}
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-semibold text-sm text-[#111827]">
              {isUk ? 'Розподіл культур' : 'Crop distribution'}
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
                {isUk ? 'Немає даних' : 'No data yet'}
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
                        isUk ? CROP_LABELS_UK[name as keyof typeof CROP_LABELS_UK] ?? name : name,
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
                        {isUk
                          ? CROP_LABELS_UK[item.crop as keyof typeof CROP_LABELS_UK] ?? item.crop
                          : CROP_LABELS_EN[item.crop as keyof typeof CROP_LABELS_EN] ?? item.crop}
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
              {isUk ? 'Останні поля' : 'Recent fields'}
            </h2>
            <Link
              to="/dashboard/fields"
              className="text-xs text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 transition-colors font-medium"
            >
              {isUk ? 'Всі поля' : 'All fields'} <ArrowRight size={12} />
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
                <p className="text-sm mb-3">{isUk ? 'Полів ще немає' : 'No fields yet'}</p>
                <Link to="/dashboard/map">
                  <Button size="sm" variant="secondary" icon={<Plus size={13} />}>
                    {isUk ? 'Додати перше поле' : 'Add first field'}
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
                        {isUk
                          ? CROP_LABELS_UK[field.crop_type as keyof typeof CROP_LABELS_UK]
                          : CROP_LABELS_EN[field.crop_type as keyof typeof CROP_LABELS_EN]}
                      </p>
                    </div>
                    {field.latest_ndvi != null && (
                      <NDVIChip value={field.latest_ndvi} className="shrink-0" />
                    )}
                    <span className="text-sm font-medium text-[#16a34a] tabular-nums shrink-0">
                      {formatArea(field.area_ha)}
                    </span>
                    <ArrowRight size={13} className="text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
