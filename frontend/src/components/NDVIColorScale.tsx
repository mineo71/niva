import { ndviToHex } from '@/lib/ndvi'
import { cn } from '@/lib/utils'

interface NDVIColorScaleProps {
  className?: string
  showLabels?: boolean
  orientation?: 'horizontal' | 'vertical'
  width?: number
  height?: number
}

const STOPS = [-1, -0.5, 0, 0.25, 0.5, 0.75, 1]

export function NDVIColorScale({
  className,
  showLabels = true,
  orientation = 'horizontal',
}: NDVIColorScaleProps) {
  // Build gradient string from stops
  const gradientColors = Array.from({ length: 20 }, (_, i) => {
    const v = -1 + (i / 19) * 2
    return ndviToHex(v)
  })

  const gradientStr = gradientColors.join(', ')

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div
          className="h-3 rounded-full"
          style={{ background: `linear-gradient(to right, ${gradientStr})` }}
        />
        {showLabels && (
          <div className="flex justify-between text-[10px] text-[#6b9e78] font-mono">
            {STOPS.map((s) => (
              <span key={s}>{s.toFixed(1)}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 items-stretch', className)}>
      <div
        className="w-3 rounded-full"
        style={{ background: `linear-gradient(to bottom, ${[...gradientColors].reverse().join(', ')})` }}
      />
      {showLabels && (
        <div className="flex flex-col justify-between text-[10px] text-[#6b9e78] font-mono">
          {[...STOPS].reverse().map((s) => (
            <span key={s}>{s.toFixed(1)}</span>
          ))}
        </div>
      )}
    </div>
  )
}

interface NDVIChipProps {
  value: number
  className?: string
}

export function NDVIChip({ value, className }: NDVIChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium',
        className
      )}
      style={{
        backgroundColor: `${ndviToHex(value)}22`,
        color: ndviToHex(value),
        borderColor: `${ndviToHex(value)}44`,
        border: '1px solid',
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: ndviToHex(value) }}
      />
      {value.toFixed(3)}
    </span>
  )
}
