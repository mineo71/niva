import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, MapPin, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { statsApi } from '@/api/stats'
import { fieldsApi } from '@/api/fields'
import type { StatsResponse, FieldResponse } from '@/types'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatArea, CROP_LABELS_UK, CROP_LABELS_EN, CROP_ICONS } from '@/lib/utils'
import { toast } from 'react-toastify'

const CHART_COLORS = ['#4ade80', '#f59e0b', '#60a5fa', '#a78bfa', '#fb923c', '#34d399', '#f472b6', '#94a3b8']

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
    },
    {
      label: isUk ? 'Загальна площа' : 'Total area',
      value: formatArea(stats?.total_area_ha ?? 0),
      icon: MapPin,
      hint: isUk ? 'Усі поля разом' : 'All fields combined',
    },
    {
      label: isUk ? 'Культур' : 'Crops',
      value: stats?.crop_distribution.length ?? 0,
      icon: TrendingUp,
      hint: isUk ? 'Різних типів культур' : 'Different crop types',
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#f0f4f1]">
            {isUk ? 'Огляд' : 'Overview'}
          </h1>
          <p className="text-sm text-[#6b9e78] mt-0.5">
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
          : statCards.map(({ label, value, icon: Icon, hint }) => (
            <Card key={label}>
              <CardBody className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#4ade80]" />
                </div>
                <div>
                  <p className="text-xs text-[#6b9e78] uppercase tracking-wider font-display mb-1">{label}</p>
                  <p className="font-display font-bold text-3xl text-[#f0f4f1]">{value}</p>
                  <p className="text-xs text-[#6b9e78] mt-1">{hint}</p>
                </div>
              </CardBody>
            </Card>
          ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Crop distribution pie chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="font-display font-semibold text-[#f0f4f1]">
              {isUk ? 'Розподіл культур' : 'Crop distribution'}
            </h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Skeleton className="w-40 h-40 rounded-full" />
              </div>
            ) : !stats?.crop_distribution.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#6b9e78] text-sm">
                <Layers size={32} className="mb-3 opacity-30" />
                {isUk ? 'Немає даних' : 'No data yet'}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.crop_distribution}
                      dataKey="count"
                      nameKey="crop"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {stats.crop_distribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1a14',
                        border: '1px solid #2d4a34',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f0f4f1',
                      }}
                      formatter={(val: number, name: string) => [
                        val,
                        isUk ? CROP_LABELS_UK[name as keyof typeof CROP_LABELS_UK] ?? name : name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {stats.crop_distribution.map((item, i) => (
                    <div key={item.crop} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[#6b9e78] flex-1">
                        {CROP_ICONS[item.crop as keyof typeof CROP_ICONS]} {' '}
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
            <h2 className="font-display font-semibold text-[#f0f4f1]">
              {isUk ? 'Останні поля' : 'Recent fields'}
            </h2>
            <Link to="/dashboard/fields" className="text-xs text-[#4ade80] hover:text-[#22c55e] flex items-center gap-1 transition-colors">
              {isUk ? 'Всі поля' : 'All fields'} <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={56} className="rounded-lg" />
                ))}
              </div>
            ) : !fields.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#6b9e78]">
                <MapPin size={32} className="mb-3 opacity-30" />
                <p className="text-sm mb-4">{isUk ? 'Полів ще немає' : 'No fields yet'}</p>
                <Link to="/dashboard/map">
                  <Button size="sm" variant="secondary" icon={<Plus size={14} />}>
                    {isUk ? 'Додати перше поле' : 'Add first field'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#1e3022]">
                {fields.map((field) => (
                  <Link
                    key={field.id}
                    to={`/dashboard/fields/${field.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#112018] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#112018] border border-[#1e3022] flex items-center justify-center text-base shrink-0 group-hover:border-[#2d4a34] transition-colors">
                      {CROP_ICONS[field.crop_type as keyof typeof CROP_ICONS]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#f0f4f1] truncate">{field.name}</p>
                      <p className="text-xs text-[#6b9e78]">
                        {isUk
                          ? CROP_LABELS_UK[field.crop_type as keyof typeof CROP_LABELS_UK]
                          : CROP_LABELS_EN[field.crop_type as keyof typeof CROP_LABELS_EN]}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono text-[#4ade80]">{formatArea(field.area_ha)}</p>
                    </div>
                    <ArrowRight size={14} className="text-[#3d7050] group-hover:text-[#4ade80] transition-colors shrink-0" />
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
