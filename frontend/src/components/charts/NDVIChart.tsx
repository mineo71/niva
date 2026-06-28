import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { IndexDataPoint } from '@/types'
import { ndviToHex } from '@/lib/ndvi'
import { formatShortDate } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface NDVIChartProps {
  data: IndexDataPoint[]
  showEvi?: boolean
  showNdmi?: boolean
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
  const ndviVal = payload.find((p) => p.name === 'ndvi')?.value ?? 0

  return (
    <div className="bg-[#0d1a14] border border-[#2d4a34] rounded-lg px-3 py-2.5 shadow-xl text-xs font-sans">
      <p className="text-[#6b9e78] mb-2">{formatShortDate(label ?? '', i18n.language)}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[#f0f4f1] uppercase font-mono text-[10px]">{p.name.toUpperCase()}</span>
          <span className="ml-auto pl-3 font-mono" style={{ color: p.name === 'ndvi' ? ndviToHex(ndviVal) : p.color }}>
            {p.value.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function NDVIChart({ data, showEvi = false, showNdmi = false, height = 260 }: NDVIChartProps) {
  const { i18n } = useTranslation()

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-[#6b9e78]"
        style={{ height }}
      >
        {i18n.language === 'uk' ? 'Немає даних' : 'No data'}
      </div>
    )
  }

  const tickFormatter = (val: string) => {
    try {
      return new Date(val).toLocaleDateString(i18n.language === 'uk' ? 'uk-UA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return val
    }
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,48,34,0.8)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={tickFormatter}
          tick={{ fill: '#6b9e78', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: '#1e3022' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[-0.1, 1]}
          tick={{ fill: '#6b9e78', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          tickCount={6}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0.3} stroke="#6b9e78" strokeDasharray="4 4" opacity={0.4} />
        <ReferenceLine y={0.6} stroke="#4ade80" strokeDasharray="4 4" opacity={0.3} />

        {/* NDVI — primary, colored dynamically per value */}
        <Line
          type="monotone"
          dataKey="ndvi"
          stroke="#4ade80"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
        />
        {showEvi && (
          <Line
            type="monotone"
            dataKey="evi"
            stroke="#60a5fa"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
          />
        )}
        {showNdmi && (
          <Line
            type="monotone"
            dataKey="ndmi"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
