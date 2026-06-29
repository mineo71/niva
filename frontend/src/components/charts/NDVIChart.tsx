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
    <div className="bg-white border border-[#e5e7eb] rounded-lg px-3 py-2.5 shadow-md text-xs">
      <p className="text-[#6b7280] mb-2 font-medium">{formatShortDate(label ?? '', i18n.language)}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[#374151] uppercase font-semibold text-[10px] tracking-wide">{p.name.toUpperCase()}</span>
          <span
            className="ml-auto pl-3 tabular-nums font-medium"
            style={{ color: p.name === 'ndvi' ? ndviToHex(ndviVal) : p.color }}
          >
            {p.value.toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function NDVIChart({ data, showEvi = false, showNdmi = false, height = 260 }: NDVIChartProps) {
  const { i18n, t } = useTranslation()

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-sm text-[#9ca3af]" style={{ height }}>
        {t('common.noData')}
      </div>
    )
  }

  const tickFormatter = (val: string) => {
    try {
      return new Date(val).toLocaleDateString(i18n.language, {
        month: 'short', day: 'numeric',
      })
    } catch { return val }
  }

  const latest = data[data.length - 1]?.ndvi
  const summary = t('indices.chartSummary', { count: data.length, latest: latest?.toFixed(2) ?? '—' })

  return (
    <div role="img" aria-label={summary}>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={tickFormatter}
          tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={{ stroke: '#f3f4f6' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[-0.1, 1]}
          tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          tickCount={6}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0.3} stroke="#e5e7eb" strokeDasharray="4 4" />
        <ReferenceLine y={0.6} stroke="#d1fae5" strokeDasharray="4 4" />

        <Line
          type="monotone"
          dataKey="ndvi"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }}
        />
        {showEvi && (
          <Line
            type="monotone"
            dataKey="evi"
            stroke="#2563eb"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
          />
        )}
        {showNdmi && (
          <Line
            type="monotone"
            dataKey="ndmi"
            stroke="#d97706"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 3, fill: '#d97706', strokeWidth: 0 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}
