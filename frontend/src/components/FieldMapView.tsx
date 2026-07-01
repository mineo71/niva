import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle } from 'lucide-react'
import { insightsApi } from '@/api/insights'
import type { FieldResponse, TimelinePoint } from '@/types'
import { formatArea, formatDate } from '@/lib/utils'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

const CLASSES = [
  { key: 'excellent', color: '#16a34a', range: '0.7–1.0' },
  { key: 'good', color: '#84cc16', range: '0.5–0.7' },
  { key: 'moderate', color: '#eab308', range: '0.3–0.5' },
  { key: 'poor', color: '#c2410c', range: '< 0.3' },
] as const

function centroid(ring: number[][]): [number, number] {
  const pts = ring.slice(0, -1) // drop closing point
  const n = pts.length || 1
  const [sx, sy] = pts.reduce(([x, y], p) => [x + p[0], y + p[1]], [0, 0])
  return [sx / n, sy / n]
}

export function FieldMapView({ field }: { field: FieldResponse }) {
  const { t, i18n } = useTranslation()

  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popupRef = useRef<any>(null)
  const reqId = useRef(0)

  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [imgMissing, setImgMissing] = useState(false)

  const selectedPoint = timeline.find((d) => d.date === selected) ?? null

  // ── init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.startsWith('pk.your')) {
      setMapError(true)
      return
    }
    let mounted = true

    const init = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      if (!mounted || !mapRef.current) return
      mapboxgl.accessToken = MAPBOX_TOKEN

      const ring = field.geometry.coordinates[0]
      const lons = ring.map((p) => p[0])
      const lats = ring.map((p) => p[1])
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ]

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        bounds,
        fitBoundsOptions: { padding: 60 },
        attributionControl: false,
      })
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left')

      map.on('load', () => {
        if (!mounted) return
        // the page mounts under a fade-in transform — force a resize + refit so
        // the GL canvas paints instead of staying black
        map.resize()
        map.fitBounds(bounds, { padding: 60, duration: 0 })
        setTimeout(() => mounted && map.resize(), 250)
        // field outline
        map.addSource('field-poly', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: field.geometry },
        })
        map.addLayer({
          id: 'field-outline',
          type: 'line',
          source: 'field-poly',
          paint: { 'line-color': '#22c55e', 'line-width': 2.5 },
        })

        // label popup at centroid
        const [clon, clat] = centroid(ring)
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'niva-field-popup',
          offset: 12,
        })
          .setLngLat([clon, clat])
          .setHTML(
            `<div style="font-weight:600;color:#111827">${field.name}</div>` +
              `<div style="color:#6b7280;font-size:12px;margin-top:2px">${t(
                `crops.${field.crop_type}`,
                { defaultValue: field.crop_type }
              )} · ${formatArea(field.area_ha, i18n.language)}</div>`
          )
          .addTo(map)

        setReady(true)
      })

      mapInstance.current = map
    }
    init().catch(() => mounted && setMapError(true))

    return () => {
      mounted = false
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── load timeline ─────────────────────────────────────────────────────────
  useEffect(() => {
    let on = true
    insightsApi
      .timeline(String(field.id))
      .then((res) => {
        if (!on) return
        setTimeline(res.dates)
        if (res.dates.length) setSelected(res.dates[res.dates.length - 1].date)
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [field.id])

  // ── load heatmap for selected date ────────────────────────────────────────
  useEffect(() => {
    if (!ready || !selected || !mapInstance.current) return
    const map = mapInstance.current
    const rid = ++reqId.current
    setImgLoading(true)
    setImgMissing(false)

    insightsApi
      .heatmap(String(field.id), selected)
      .then((res) => {
        if (rid !== reqId.current) return
        const src = map.getSource('ndvi-img')
        if (src) {
          src.updateImage({ url: res.image, coordinates: res.coordinates })
        } else {
          map.addSource('ndvi-img', {
            type: 'image',
            url: res.image,
            coordinates: res.coordinates,
          })
          map.addLayer(
            {
              id: 'ndvi-layer',
              type: 'raster',
              source: 'ndvi-img',
              paint: { 'raster-opacity': 0.85, 'raster-fade-duration': 0 },
            },
            'field-outline'
          )
        }
      })
      .catch(() => {
        if (rid !== reqId.current) return
        setImgMissing(true)
        if (map.getLayer('ndvi-layer')) map.setLayoutProperty('ndvi-layer', 'visibility', 'none')
      })
      .finally(() => {
        if (rid === reqId.current) setImgLoading(false)
      })
  }, [ready, selected, field.id])

  // re-show layer after a missing date
  useEffect(() => {
    const map = mapInstance.current
    if (map?.getLayer?.('ndvi-layer') && !imgMissing) {
      map.setLayoutProperty('ndvi-layer', 'visibility', 'visible')
    }
  }, [imgMissing])

  if (mapError) return null

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#0b1a12]">
      <div ref={mapRef} className="h-[420px] w-full" />

      {/* loading imagery */}
      {imgLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 bg-white/95 rounded-full px-3 py-1.5 shadow-sm text-xs text-[#374151]">
          <Loader2 size={13} className="animate-spin text-[#16a34a]" />
          {t('fieldDetail.loadingImagery')}
        </div>
      )}
      {imgMissing && !imgLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 bg-white/95 rounded-full px-3 py-1.5 shadow-sm text-xs text-[#d97706]">
          <AlertCircle size={13} />
          {t('fieldDetail.noImagery')}
        </div>
      )}

      {/* area distribution panel */}
      {selectedPoint && (
        <div className="absolute top-3 right-3 z-10 w-52 sm:w-60 bg-white/95 backdrop-blur-sm rounded-xl border border-[#e5e7eb] shadow-lg p-3.5">
          <p className="font-semibold text-sm text-[#111827] mb-3">
            {t('fieldDetail.areaDistribution')}
          </p>
          <div className="space-y-2.5">
            {CLASSES.map((c) => {
              const pct = selectedPoint.distribution[c.key]
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#374151]">
                      <span className="font-medium">{t(`fieldDetail.class${c.key[0].toUpperCase()}${c.key.slice(1)}`)}</span>
                      <span className="text-[#9ca3af] ml-1">({c.range})</span>
                    </span>
                    <span className="font-semibold text-[#111827] tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* date timeline */}
      {timeline.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex gap-1.5 overflow-x-auto pb-1 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
            {timeline.map((d) => {
              const active = d.date === selected
              return (
                <button
                  key={d.date}
                  onClick={() => setSelected(d.date)}
                  className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium tabular-nums transition-colors ${
                    active
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
                  }`}
                >
                  {formatDate(d.date, i18n.language)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
