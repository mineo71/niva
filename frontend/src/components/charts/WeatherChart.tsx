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
  const { i18n } = useTranslation()
  if (!active || !payload?.length) return null

  const isUk = i18n.language === 'uk'

  return (
    <div className="bg-[#0d1a14] border border-[#2d4a34] rounded-lg px-3 py-2.5 shadow-xl text-xs font-sans">
      <p className="text-[#6b9e78] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[#6b9e78]">
            {p.name === 'temp_c'
              ? isUk ? 'Темп.' : 'Temp.'
              : isUk ? 'Дощ' : 'Rain'}
          </span>
          <span className="ml-auto pl-3 font-mono text-[#f0f4f1]">
            {p.value.toFixed(1)}{p.name === 'temp_c' ? '°C' : ' мм'}
          </span>
        </div>
      ))}
    </div>
  )
}

export function WeatherChart({ data, height = 200 }: WeatherChartProps) {
  const { i18n } = useTranslation()

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(
      i18n.language === 'uk' ? 'uk-UA' : 'en-US',
      { weekday: 'short', day: 'numeric' }
    ),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={formatted} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,48,34,0.8)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#6b9e78', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: '#1e3022' }}
          tickLine={false}
        />
        <YAxis
          yAxisId="temp"
          tick={{ fill: '#6b9e78', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          unit="°"
        />
        <YAxis
          yAxisId="rain"
          orientation="right"
          tick={{ fill: '#6b9e78', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          unit="мм"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="rain" dataKey="rain_mm" fill="#60a5fa" opacity={0.35} radius={[3, 3, 0, 0]} />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="temp_c"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
