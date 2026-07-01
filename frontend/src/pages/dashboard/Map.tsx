import { useEffect, useRef, useState, useCallback } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { Ruler, Save, RotateCcw, AlertCircle, MapPin, Pencil, LocateFixed, MousePointerClick, List, X, Search } from 'lucide-react'
import type { Feature, Polygon } from 'geojson'
import { fieldsApi } from '@/api/fields'
import type { CropType, SoilType, FieldResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody } from '@/components/ui/Card'
import { CropIcon } from '@/components/CropIcon'
import { NDVIChip } from '@/components/NDVIColorScale'
import { formatArea, ALL_CROPS, ALL_SOILS } from '@/lib/utils'
import { ndviToHex } from '@/lib/ndvi'
import { getApiErrorMessage } from '@/lib/apiErrors'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

function ringCentroid(ring: number[][]): [number, number] {
  const pts = ring.slice(0, -1)
  const n = pts.length || 1
  const [sx, sy] = pts.reduce(([x, y], p) => [x + p[0], y + p[1]], [0, 0])
  return [sx / n, sy / n]
}

export function MapPage() {
  const { id } = useParams<{ id?: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isEdit = !!id

  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawRef = useRef<any>(null)
  // popup opener stored so the fields list can trigger it from outside the map closure
  const popupFnRef = useRef<((lngLat: [number, number], p: Record<string, string>) => void) | null>(null)

  const [allFields, setAllFields] = useState<FieldResponse[]>([])
  const [showList, setShowList] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [listSort, setListSort] = useState<'name' | 'area' | 'ndvi'>('name')

  const [polygon, setPolygon] = useState<Feature<Polygon> | null>(null)
  const [areaHa, setAreaHa] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [cropType, setCropType] = useState<CropType>('wheat')
  const [soilType, setSoilType] = useState<SoilType>('silt')
  const [saving, setSaving] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [locating, setLocating] = useState(false)
  const [existingCount, setExistingCount] = useState(0)

  const cropOptions = ALL_CROPS.map((c) => ({ value: c, label: t(`crops.${c}`) }))
  const soilOptions = ALL_SOILS.map((s) => ({ value: s, label: t(`soils.${s}`) }))

  const buildProps = (f: FieldResponse): Record<string, string> => ({
    id: String(f.id),
    name: f.name,
    crop: t(`crops.${f.crop_type}`, { defaultValue: f.crop_type }),
    area: formatArea(f.area_ha, i18n.language),
    ndvi: f.latest_ndvi != null ? f.latest_ndvi.toFixed(3) : '—',
    ndviColor: f.latest_ndvi != null ? ndviToHex(f.latest_ndvi) : '#9ca3af',
  })

  const flyToField = (f: FieldResponse) => {
    const map = mapInstanceRef.current
    if (!map) return
    const c = ringCentroid(f.geometry.coordinates[0])
    map.flyTo({ center: c, zoom: 14, duration: 800 })
    setTimeout(() => popupFnRef.current?.(c, buildProps(f)), 850)
    setShowList(false)
  }

  const listSortOptions = [
    { value: 'name', label: t('fields.sortName') },
    { value: 'area', label: t('fields.sortAreaDesc') },
    { value: 'ndvi', label: t('fields.sortNdviDesc') },
  ]

  const listFields = allFields
    .filter((f) => f.name.toLowerCase().includes(listSearch.toLowerCase()))
    .sort((a, b) => {
      if (listSort === 'area') return b.area_ha - a.area_ha
      if (listSort === 'ndvi') return (b.latest_ndvi ?? -1) - (a.latest_ndvi ?? -1)
      return a.name.localeCompare(b.name)
    })

  const computeArea = useCallback(async (feature: Feature<Polygon>) => {
    try {
      const turfModule = await import('@turf/turf')
      const areaSqM = turfModule.area(feature)
      setAreaHa(areaSqM / 10000)
    } catch {
      setAreaHa(null)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    fieldsApi.get(id).then((field) => {
      setName(field.name)
      setCropType(field.crop_type)
      setSoilType(field.soil_type)
    }).catch(() => {
      toast.error(t('map.fieldNotFound'))
    })
  }, [id, t])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.startsWith('pk.your')) {
      setMapError(true)
      return
    }

    let mounted = true

    const init = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default
        const MapboxDraw = (await import('@mapbox/mapbox-gl-draw')).default
        const MapboxGeocoder = (await import('@mapbox/mapbox-gl-geocoder')).default
        if (!mounted || !mapRef.current) return

        mapboxgl.accessToken = MAPBOX_TOKEN

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [32.0, 49.0],
          zoom: 6,
        })

        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true },
          defaultMode: 'simple_select',
          styles: [
            {
              id: 'gl-draw-polygon-fill',
              type: 'fill',
              filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              paint: { 'fill-color': '#16a34a', 'fill-opacity': 0.2 },
            },
            {
              id: 'gl-draw-polygon-stroke',
              type: 'line',
              filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
              paint: { 'line-color': '#16a34a', 'line-width': 2, 'line-opacity': 0.9 },
            },
            {
              id: 'gl-draw-polygon-vertex',
              type: 'circle',
              filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
              paint: {
                'circle-radius': 5,
                'circle-color': '#16a34a',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              },
            },
          ],
        })

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
        map.addControl(draw, 'top-right')

        // address search → fly to location
        const geocoder = new MapboxGeocoder({
          accessToken: MAPBOX_TOKEN,
          mapboxgl: mapboxgl as never,
          marker: false,
          placeholder: t('map.searchAddress'),
          flyTo: { maxZoom: 15 },
        })
        map.addControl(geocoder as never, 'top-left')

        // Read-only overlay: NDVI polygons + clustered centroid pins + click popup
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadExistingFields = async () => {
          try {
            const fields = await fieldsApi.list()
            if (!mounted) return
            setAllFields(fields)
            const others = fields.filter((f) => String(f.id) !== String(id))
            if (!others.length) return

            // shared popup opener — used by polygons, pins and the fields list
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let fieldPopup: any = null
            const showFieldPopup = (lngLat: [number, number], p: Record<string, string>) => {
              if (fieldPopup) fieldPopup.remove()
              const el = document.createElement('div')
              el.innerHTML =
                `<div style="font-weight:600;color:#111827;font-size:14px">${p.name}</div>` +
                `<div style="color:#6b7280;font-size:12px;margin-top:2px">${p.crop} · ${p.area}</div>` +
                (p.ndvi !== '—'
                  ? `<div style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:12px;font-weight:600;color:#111827">` +
                    `<span style="width:9px;height:9px;border-radius:9999px;background:${p.ndviColor}"></span>NDVI ${p.ndvi}</div>`
                  : '')
              const btn = document.createElement('button')
              btn.textContent = t('fields.details')
              btn.setAttribute(
                'style',
                'margin-top:10px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:6px;' +
                  'padding:6px 10px;border-radius:8px;font-size:13px;font-weight:600;color:#16a34a;' +
                  'background:#f0fdf4;border:1px solid #bbf7d0;cursor:pointer'
              )
              btn.onclick = () => { fieldPopup?.remove(); navigate(`/dashboard/fields/${p.id}`) }
              el.appendChild(btn)
              fieldPopup = new mapboxgl.Popup({ closeButton: true, className: 'niva-field-popup', offset: 12, maxWidth: '220px' })
                .setLngLat(lngLat).setDOMContent(el).addTo(map)
            }
            popupFnRef.current = showFieldPopup

            // ── NDVI polygons ──
            const fc = {
              type: 'FeatureCollection' as const,
              features: others.map((f) => ({
                type: 'Feature' as const,
                geometry: f.geometry,
                properties: buildProps(f),
              })),
            }
            if (map.getSource('existing-fields')) {
              ;(map.getSource('existing-fields') as { setData: (d: unknown) => void }).setData(fc)
            } else {
              map.addSource('existing-fields', { type: 'geojson', data: fc })
              map.addLayer({ id: 'existing-fill', type: 'fill', source: 'existing-fields', paint: { 'fill-color': ['get', 'ndviColor'], 'fill-opacity': 0.45 } })
              map.addLayer({ id: 'existing-line', type: 'line', source: 'existing-fields', paint: { 'line-color': ['get', 'ndviColor'], 'line-width': 2 } })
              map.on('click', 'existing-fill', (e: { lngLat: { lng: number; lat: number }; features?: Array<{ properties: Record<string, string> | null }> }) => {
                const p = e.features?.[0]?.properties
                if (p) showFieldPopup([e.lngLat.lng, e.lngLat.lat], p)
              })
              map.on('mouseenter', 'existing-fill', () => { map.getCanvas().style.cursor = 'pointer' })
              map.on('mouseleave', 'existing-fill', () => { map.getCanvas().style.cursor = '' })
            }

            // ── clustered centroid pins (stay visible when zoomed out) ──
            const pts = {
              type: 'FeatureCollection' as const,
              features: others.map((f) => ({
                type: 'Feature' as const,
                geometry: { type: 'Point' as const, coordinates: ringCentroid(f.geometry.coordinates[0]) },
                properties: buildProps(f),
              })),
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (map.getSource('field-points')) {
              ;(map.getSource('field-points') as { setData: (d: unknown) => void }).setData(pts)
            } else {
              map.addSource('field-points', { type: 'geojson', data: pts, cluster: true, clusterRadius: 48, clusterMaxZoom: 13 })
              map.addLayer({
                id: 'clusters', type: 'circle', source: 'field-points', filter: ['has', 'point_count'],
                paint: { 'circle-color': '#16a34a', 'circle-opacity': 0.92, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 26] },
              })
              map.addLayer({
                id: 'cluster-count', type: 'symbol', source: 'field-points', filter: ['has', 'point_count'],
                layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13, 'text-allow-overlap': true },
                paint: { 'text-color': '#ffffff' },
              })
              map.addLayer({
                id: 'unclustered', type: 'circle', source: 'field-points', filter: ['!', ['has', 'point_count']],
                paint: { 'circle-color': ['get', 'ndviColor'], 'circle-radius': 7, 'circle-stroke-width': 2.5, 'circle-stroke-color': '#ffffff' },
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              map.on('click', 'clusters', (e: any) => {
                const feat = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0]
                const cid = feat.properties?.cluster_id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const center = (feat.geometry as any).coordinates as [number, number]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(map.getSource('field-points') as any).getClusterExpansionZoom(cid, (err: unknown, z: number) => {
                  if (err) return
                  map.easeTo({ center, zoom: z })
                })
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              map.on('click', 'unclustered', (e: any) => {
                const p = e.features?.[0]?.properties
                if (p) showFieldPopup(e.features[0].geometry.coordinates as [number, number], p)
              })
              for (const layer of ['clusters', 'unclustered']) {
                map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
                map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
              }
            }

            setExistingCount(others.length)

            // when adding a new field, frame the existing portfolio
            if (!id) {
              const all = others.flatMap((f) => f.geometry.coordinates[0])
              const lons = all.map((c: number[]) => c[0])
              const lats = all.map((c: number[]) => c[1])
              map.fitBounds(
                [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
                { padding: 100, maxZoom: 13, duration: 0 }
              )
            }
          } catch {
            /* non-fatal: overlay is optional */
          }
        }

        map.on('load', () => {
          setMapReady(true)
          loadExistingFields()
          if (id) {
            fieldsApi.get(id).then((field) => {
              const feature: Feature<Polygon> = {
                type: 'Feature',
                geometry: field.geometry,
                properties: {},
              }
              draw.add(feature)
              setPolygon(feature)
              computeArea(feature)
              const coords = field.geometry.coordinates[0]
              const lons = coords.map((c: number[]) => c[0])
              const lats = coords.map((c: number[]) => c[1])
              map.fitBounds(
                [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
                { padding: 80, maxZoom: 15 }
              )
            }).catch(() => {})
          }
        })

        const handleDrawChange = () => {
          const data = draw.getAll()
          const features = data.features as Feature<Polygon>[]
          if (features.length > 0) {
            const feat = features[features.length - 1]
            setPolygon(feat)
            computeArea(feat)
          } else {
            setPolygon(null)
            setAreaHa(null)
          }
        }

        map.on('draw.create', handleDrawChange)
        map.on('draw.update', handleDrawChange)
        map.on('draw.delete', handleDrawChange)
        map.on('draw.modechange', (e: { mode: string }) => setDrawing(e.mode === 'draw_polygon'))

        mapInstanceRef.current = map
        drawRef.current = draw
        if (import.meta.env.DEV) {
          // expose for e2e/debugging in dev only
          ;(window as unknown as Record<string, unknown>).__niva = { map, draw, onChange: handleDrawChange }
        }
      } catch {
        if (mounted) setMapError(true)
      }
    }

    init()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        drawRef.current = null
      }
    }
  }, []) // eslint-disable-line

  const handleReset = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll()
      drawRef.current.changeMode('simple_select')
    }
    setPolygon(null)
    setAreaHa(null)
    setDrawing(false)
  }

  const startDraw = () => {
    if (!drawRef.current) return
    drawRef.current.deleteAll() // one field at a time
    setPolygon(null)
    setAreaHa(null)
    drawRef.current.changeMode('draw_polygon')
    setDrawing(true)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
        })
        setLocating(false)
      },
      () => {
        toast.error(t('map.locationFailed'))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('map.enterFieldName'))
      return
    }
    if (!polygon) {
      toast.error(t('map.drawPolygonFirst'))
      return
    }
    setSaving(true)
    try {
      const payload = { name: name.trim(), crop_type: cropType, soil_type: soilType, geometry: polygon.geometry }
      if (isEdit && id) {
        await fieldsApi.update(id, payload)
        toast.success(t('map.fieldUpdated'))
        navigate(`/dashboard/fields/${id}`)
      } else {
        const created = await fieldsApi.create(payload)
        toast.success(t('map.fieldAdded'))
        navigate(`/dashboard/fields/${created.id}`)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, t('map.saveFailed')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Sidebar */}
      <div className="w-full lg:w-72 lg:shrink-0 flex flex-col bg-white border-b lg:border-b-0 lg:border-r border-[#e5e7eb] z-10 max-h-[45vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
        <div className="px-5 py-4 border-b border-[#f3f4f6]">
          <h1 className="font-semibold text-base text-[#111827] tracking-tight">
            {isEdit ? t('map.editField') : t('map.newField')}
          </h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {t('map.drawInstruction')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Area display */}
          <Card>
            <CardBody className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center shrink-0">
                <Ruler size={15} className="text-[#16a34a]" />
              </div>
              <div>
                <p className="text-xs text-[#9ca3af]">{t('map.fieldArea')}</p>
                <p className="font-semibold text-sm text-[#16a34a] tabular-nums">
                  {areaHa != null ? formatArea(areaHa) : '—'}
                </p>
              </div>
              {polygon && (
                <button
                  onClick={handleReset}
                  title={t('map.reset')}
                  aria-label={t('map.resetPolygon')}
                  className="ml-auto p-1.5 rounded-lg text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </CardBody>
          </Card>

          {/* Drawing tools */}
          {mapReady && (
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={useMyLocation}
                loading={locating}
                icon={<LocateFixed size={14} />}
              >
                {t('map.useMyLocation')}
              </Button>
              <Button
                variant={polygon ? 'outline' : 'primary'}
                className="w-full"
                onClick={startDraw}
                disabled={drawing}
                icon={<Pencil size={14} />}
              >
                {drawing ? t('map.drawing') : polygon ? t('map.redrawField') : t('map.drawField')}
              </Button>
            </div>
          )}

          {/* Guidance */}
          {mapReady && (drawing || !polygon) && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 text-xs space-y-1.5">
              <p className="text-[#16a34a] font-semibold flex items-center gap-1.5">
                <MousePointerClick size={13} />
                {drawing ? t('map.drawFieldOutline') : t('map.howToDrawField')}
              </p>
              {drawing ? (
                <ul className="text-[#6b7280] space-y-0.5 list-disc list-inside">
                  <li>{t('map.clickCorners')}</li>
                  <li>{t('map.doubleClickFinish')}</li>
                  <li>{t('map.escCancel')}</li>
                </ul>
              ) : (
                <p className="text-[#6b7280]">
                  {t('map.findLocation')}
                </p>
              )}
            </div>
          )}
          {polygon && !drawing && (
            <p className="text-xs text-[#16a34a] flex items-center gap-1.5">
              <MousePointerClick size={13} />
              {t('map.dragPoints')}
            </p>
          )}
          {!mapReady && !mapError && (
            <p className="text-xs text-[#9ca3af]">{t('map.mapLoading')}</p>
          )}

          {/* Form */}
          <div className="space-y-3">
            <Input
              label={t('fields.name')}
              placeholder={t('map.fieldNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<MapPin size={14} />}
            />
            <Select
              label={t('fields.crop')}
              value={cropType}
              onValueChange={(v) => setCropType(v as CropType)}
              options={cropOptions}
              placeholder={t('map.cropPlaceholder')}
            />
            <Select
              label={t('fields.soil')}
              value={soilType}
              onValueChange={(v) => setSoilType(v as SoilType)}
              options={soilOptions}
              placeholder={t('map.soilPlaceholder')}
            />
          </div>

        </div>

        <div className="p-5 border-t border-[#f3f4f6]">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!polygon || !name.trim()}
            className="w-full"
            icon={<Save size={15} />}
          >
            {isEdit ? t('map.saveChanges') : t('map.saveField')}
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative bg-[#f9fafb] min-h-[55vh] lg:min-h-0">
        {mapError ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-10">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e7eb] shadow-sm flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-[#d97706]" />
            </div>
            <h3 className="font-semibold text-[#111827] mb-1.5">
              {t('map.mapUnavailable')}
            </h3>
            <p className="text-sm text-[#6b7280] max-w-xs leading-relaxed">
              {t('map.mapboxRequired')}
            </p>
            <code className="mt-4 text-xs bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2 text-[#16a34a] font-mono">
              VITE_MAPBOX_TOKEN=pk.your_token_here
            </code>
          </div>
        ) : (
          <div
            ref={mapRef}
            role="application"
            aria-label={isEdit ? t('map.editField') : t('map.newField')}
            className="w-full h-full"
          />
        )}

        {/* NDVI legend for existing fields overlay */}
        {mapReady && existingCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-lg shadow-sm px-3 py-2">
            <p className="text-[10px] font-semibold text-[#374151] mb-1.5">
              {t('map.yourFields')} · NDVI
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[#9ca3af]">{t('map.ndviLow')}</span>
              <span
                className="h-2 w-24 rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, #a05028 0%, #d2c850 40%, #5ab950 65%, #0a6428 100%)',
                }}
              />
              <span className="text-[9px] text-[#9ca3af]">{t('map.ndviHigh')}</span>
            </div>
          </div>
        )}

        {/* Fields list toggle + slide-in panel */}
        {mapReady && existingCount > 0 && (
          <>
            {!showList && (
              <button
                onClick={() => setShowList(true)}
                className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-lg shadow-sm px-3 py-2 text-xs font-medium text-[#374151] hover:bg-white transition-colors"
              >
                <List size={15} className="text-[#16a34a]" />
                {t('map.yourFields')}
              </button>
            )}
            {showList && (
              <div className="absolute top-3 right-3 bottom-3 z-20 w-72 max-w-[85%] bg-white rounded-xl border border-[#e5e7eb] shadow-xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
                  <h3 className="font-semibold text-sm text-[#111827]">
                    {t('map.yourFields')} <span className="text-[#9ca3af] font-normal">({allFields.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowList(false)}
                    aria-label={t('common.cancel')}
                    className="p-1 rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6]"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="px-3 py-2.5 space-y-2 border-b border-[#f3f4f6]">
                  <Input
                    placeholder={t('fields.searchPlaceholder')}
                    leftIcon={<Search size={14} />}
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                  />
                  <Select
                    value={listSort}
                    onValueChange={(v) => setListSort(v as 'name' | 'area' | 'ndvi')}
                    options={listSortOptions}
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                  {listFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => flyToField(f)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center shrink-0">
                        <CropIcon crop={f.crop_type} size={15} className="text-[#16a34a]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#111827] truncate">{f.name}</p>
                        <p className="text-xs text-[#9ca3af]">{formatArea(f.area_ha, i18n.language)}</p>
                      </div>
                      {f.latest_ndvi != null && <NDVIChip value={f.latest_ndvi} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
