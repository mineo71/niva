import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTranslation } from 'react-i18next'
import {
  Loader2, AlertCircle, ChevronLeft, ChevronRight, Crosshair, SlidersHorizontal,
} from 'lucide-react'
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
  const boundsRef = useRef<[[number, number], [number, number]] | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const reqId = useRef(0)
  const animRef = useRef<number | null>(null)

  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [imgMissing, setImgMissing] = useState(false)
  const [opacity, setOpacity] = useState(0.85)
  const [showOpacity, setShowOpacity] = useState(false)

  const selectedPoint = timeline.find((d) => d.date === selected) ?? null

  const recenter = () => {
    if (mapInstance.current && boundsRef.current) {
      mapInstance.current.fitBounds(boundsRef.current, { padding: 60, duration: 600 })
    }
  }

  const scrollTimeline = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

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
      boundsRef.current = bounds

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
        // field outline + a fill used for the "loading" pulse
        map.addSource('field-poly', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: field.geometry },
        })
        map.addLayer({
          id: 'field-pulse',
          type: 'fill',
          source: 'field-poly',
          paint: { 'fill-color': '#4ade80', 'fill-opacity': 0 },
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

  // keep the selected chip scrolled into view
  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selected, timeline])

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
              paint: { 'raster-opacity': opacity, 'raster-fade-duration': 0 },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selected, field.id])

  // apply opacity + re-show layer after a missing date
  useEffect(() => {
    const map = mapInstance.current
    if (!map?.getLayer?.('ndvi-layer')) return
    map.setPaintProperty('ndvi-layer', 'raster-opacity', opacity)
    map.setLayoutProperty('ndvi-layer', 'visibility', imgMissing ? 'none' : 'visible')
  }, [opacity, imgMissing])

  // minimal "breathing" pulse across the field while the heatmap loads
  useEffect(() => {
    const map = mapInstance.current
    if (!ready || !map?.getLayer?.('field-pulse')) return

    const stop = () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current)
      animRef.current = null
      if (map.getLayer('field-pulse')) map.setPaintProperty('field-pulse', 'fill-opacity', 0)
      if (map.getLayer('field-outline')) map.setPaintProperty('field-outline', 'line-width', 2.5)
    }

    if (!imgLoading) {
      stop()
      return
    }

    const tick = (ts: number) => {
      // sine wave → soft fade in/out (~1.4s period)
      const s = (Math.sin(ts / 220) + 1) / 2
      map.setPaintProperty('field-pulse', 'fill-opacity', 0.08 + s * 0.28)
      map.setPaintProperty('field-outline', 'line-width', 2 + s * 2)
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return stop
  }, [imgLoading, ready])

  if (mapError) return null

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#e5e7eb] bg-[#0b1a12]">
      <div
        ref={mapRef}
        role="application"
        aria-label={t('fieldDetail.fieldMapTitle')}
        className="h-[calc(100vh-11rem)] min-h-[440px] w-full"
      />

      {/* loading / missing imagery banner */}
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

      {/* recenter + opacity controls (below the zoom control) */}
      <div className="absolute top-[86px] left-2.5 z-10 flex flex-col gap-1.5">
        <button
          onClick={recenter}
          title={t('fieldDetail.recenter')}
          aria-label={t('fieldDetail.recenter')}
          className="w-8 h-8 rounded-lg bg-white shadow-sm border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
        >
          <Crosshair size={16} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowOpacity((v) => !v)}
            title={t('fieldDetail.opacity')}
            aria-label={t('fieldDetail.opacity')}
            className={`w-8 h-8 rounded-lg shadow-sm border flex items-center justify-center cursor-pointer transition-colors ${
              showOpacity
                ? 'bg-[#16a34a] border-[#16a34a] text-white'
                : 'bg-white border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
            }`}
          >
            <SlidersHorizontal size={16} />
          </button>
          {showOpacity && (
            <div className="absolute top-0 left-10 w-44 bg-white rounded-lg shadow-lg border border-[#e5e7eb] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-[#374151]">{t('fieldDetail.opacity')}</span>
                <span className="font-semibold text-[#111827] tabular-nums">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(opacity * 100)}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="w-full accent-[#16a34a] cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

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

      {/* date timeline — compact, centered, with scroll arrows */}
      {timeline.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm max-w-[calc(100%-1.5rem)]">
          <button
            onClick={() => scrollTimeline(-1)}
            aria-label={t('common.scrollLeft')}
            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-1.5 overflow-x-auto max-w-[52vw] sm:max-w-[380px] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {timeline.map((d) => {
              const active = d.date === selected
              return (
                <button
                  key={d.date}
                  data-active={active}
                  onClick={() => setSelected(d.date)}
                  className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer ${
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
          <button
            onClick={() => scrollTimeline(1)}
            aria-label={t('common.scrollRight')}
            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
