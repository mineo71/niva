/**
 * Lightweight inline SVG sparkline — no recharts.
 * Renders a smooth area+line chart from an array of raw numeric values.
 * Returns null if values.length < 2 (nothing to draw).
 */

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  color = '#16a34a',
  className,
}: SparklineProps) {
  if (values.length < 2) return null

  const pad = 1.5 // inner padding so strokes don't clip at edges
  const W = width  - pad * 2
  const H = height - pad * 2

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1 // avoid division by zero for flat lines

  // Map each value to (x, y) inside the padded box
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * W,
    // Invert Y: higher values → lower y coordinate (SVG top-left origin)
    y: pad + H - ((v - min) / range) * H,
  }))

  // Build smooth cubic bezier path (vertical control points create S-curves)
  let linePath = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const cpx = ((pts[i].x + pts[i + 1].x) / 2).toFixed(2)
    linePath += ` C ${cpx},${pts[i].y.toFixed(2)} ${cpx},${pts[i + 1].y.toFixed(2)} ${pts[i + 1].x.toFixed(2)},${pts[i + 1].y.toFixed(2)}`
  }

  // Close to bottom for area fill
  const areaPath =
    `${linePath} L ${pts[pts.length - 1].x.toFixed(2)},${(pad + H).toFixed(2)}` +
    ` L ${pts[0].x.toFixed(2)},${(pad + H).toFixed(2)} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle area fill */}
      <path d={areaPath} fill={color} fillOpacity="0.09" />
      {/* Line */}
      <path
        d={linePath}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
