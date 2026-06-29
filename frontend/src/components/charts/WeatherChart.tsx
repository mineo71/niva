import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { WeatherForecastDay } from '@/types'
import { useTranslation } from 'react-i18next'

interface WeatherChartProps {
  data: WeatherForecastDay[]
  height?: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg px-3 py-2.5 shadow-md text-xs">
      <p className="text-[#6b7280] font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[#374151]">
            {p.name === 'temp_c' ? t('weather.tempLabel') : t('weather.rainLabel')}
          </span>
          <span className="ml-auto pl-3 tabular-nums font-medium text-[#111827]">
            {p.value.toFixed(1)}{p.name === 'temp_c' ? '°C' : ' мм'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function WeatherChart({ data, height = 200 }: WeatherChartProps) {
  const { i18n, t } = useTranslation()

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(
      i18n.language,
      { weekday: 'short', day: 'numeric' }
    ),
  }))

  const summary = t('weather.chartSummary', { count: data.length })

  return (
    <div role="img" aria-label={summary}>
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={formatted} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={{ stroke: '#f3f4f6' }}
          tickLine={false}
        />
        <YAxis
          yAxisId="temp"
          tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          unit="°"
        />
        <YAxis
          yAxisId="rain"
          orientation="right"
          tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          unit="мм"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="rain" dataKey="rain_mm" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="temp_c"
          stroke="#d97706"
          strokeWidth={2}
          dot={{ fill: '#d97706', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#d97706', strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
    </div>
  )
}
