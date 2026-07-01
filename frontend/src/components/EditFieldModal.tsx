import { useEffect, useRef, useState, useCallback } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { X, MapPin, Ruler, Pencil, Save, AlertCircle } from 'lucide-react'
import type { Feature, Polygon } from 'geojson'
import { fieldsApi } from '@/api/fields'
import type { FieldResponse, CropType, SoilType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatArea, ALL_CROPS, ALL_SOILS } from '@/lib/utils'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

interface Props {
  field: FieldResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updated: FieldResponse) => void
}

export function EditFieldModal({ field, open, onOpenChange, onSaved }: Props) {
  const { t } = useTranslation()

  const [tab, setTab] = useState<'details' | 'location'>('details')
  const [name, setName] = useState(field.name)
  const [cropType, setCropType] = useState<CropType>(field.crop_type)
  const [soilType, setSoilType] = useState<SoilType>(field.soil_type)
  const [polygon, setPolygon] = useState<Feature<Polygon>>({
    type: 'Feature',
    properties: {},
    geometry: field.geometry,
  })
  const [areaHa, setAreaHa] = useState<number>(field.area_ha)
  const [saving, setSaving] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawRef = useRef<any>(null)

  const cropOptions = ALL_CROPS.map((c) => ({ value: c, label: t(`crops.${c}`) }))
  const soilOptions = ALL_SOILS.map((s) => ({ value: s, label: t(`soils.${s}`) }))

  const computeArea = useCallback(async (feature: Feature<Polygon>) => {
    try {
      const turf = await import('@turf/turf')
      setAreaHa(turf.area(feature) / 10000)
    } catch { /* ignore */ }
  }, [])

  // init map lazily when the location tab is first shown
  useEffect(() => {
    if (tab !== 'location' || !mapRef.current || mapInstance.current) return
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.startsWith('pk.your')) return
    let mounted = true

    const init = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      const MapboxDraw = (await import('@mapbox/mapbox-gl-draw')).default
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
        fitBoundsOptions: { padding: 50 },
        attributionControl: false,
      })
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        styles: [
          { id: 'gl-draw-polygon-fill', type: 'fill', filter: ['all', ['==', '$type', 'Polygon']], paint: { 'fill-color': '#16a34a', 'fill-opacity': 0.2 } },
          { id: 'gl-draw-polygon-stroke', type: 'line', filter: ['all', ['==', '$type', 'Polygon']], paint: { 'line-color': '#16a34a', 'line-width': 2 } },
          { id: 'gl-draw-vertex', type: 'circle', filter: ['all', ['==', 'meta', 'vertex']], paint: { 'circle-radius': 5, 'circle-color': '#16a34a', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } },
        ],
      })
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(draw, 'top-right')

      map.on('load', () => {
        if (!mounted) return
        map.resize()
        draw.add({ type: 'Feature', properties: {}, geometry: field.geometry } as Feature<Polygon>)
        map.fitBounds(bounds, { padding: 50, duration: 0 })
        setTimeout(() => mounted && map.resize(), 250)
      })

      const onChange = () => {
        const feats = draw.getAll().features as Feature<Polygon>[]
        if (feats.length) {
          const f = feats[feats.length - 1]
          setPolygon(f)
          computeArea(f)
        }
      }
      map.on('draw.create', onChange)
      map.on('draw.update', onChange)
      map.on('draw.delete', onChange)

      mapInstance.current = map
      drawRef.current = draw
    }
    init()

    return () => {
      mounted = false
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        drawRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const redraw = () => {
    if (!drawRef.current) return
    drawRef.current.deleteAll()
    drawRef.current.changeMode('draw_polygon')
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('map.enterFieldName'))
      return
    }
    setSaving(true)
    try {
      const updated = await fieldsApi.update(String(field.id), {
        name: name.trim(),
        crop_type: cropType,
        soil_type: soilType,
        geometry: polygon.geometry,
      })
      toast.success(t('map.fieldUpdated'))
      onSaved(updated)
      onOpenChange(false)
    } catch {
      toast.error(t('map.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const tabBtn = (key: 'details' | 'location', label: string) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        tab === key
          ? 'border-[#16a34a] text-[#16a34a]'
          : 'border-transparent text-[#6b7280] hover:text-[#111827]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white border border-[#e5e7eb] rounded-2xl shadow-xl shadow-black/10 data-[state=open]:animate-fade-in outline-none overflow-hidden"
        >
          {/* header */}
          <div className="px-6 pt-5">
            <RadixDialog.Title className="text-base font-semibold text-[#111827] tracking-tight">
              {t('fields.editTitle')}
            </RadixDialog.Title>
            <div className="flex gap-1 mt-4 border-b border-[#f3f4f6]">
              {tabBtn('details', t('fields.tabDetails'))}
              {tabBtn('location', t('fields.tabLocation'))}
            </div>
          </div>

          {/* body */}
          <div className="px-6 py-5">
            {tab === 'details' ? (
              <div className="space-y-4">
                <Input
                  label={t('fields.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<MapPin size={14} />}
                />
                <Select
                  label={t('fields.crop')}
                  value={cropType}
                  onValueChange={(v) => setCropType(v as CropType)}
                  options={cropOptions}
                />
                <Select
                  label={t('fields.soil')}
                  value={soilType}
                  onValueChange={(v) => setSoilType(v as SoilType)}
                  options={soilOptions}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-1.5">
                    <Ruler size={14} className="text-[#16a34a]" />
                    <span className="text-sm font-semibold text-[#16a34a] tabular-nums">
                      {formatArea(areaHa)}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" icon={<Pencil size={13} />} onClick={redraw}>
                    {t('map.redrawField')}
                  </Button>
                </div>
                {!MAPBOX_TOKEN || MAPBOX_TOKEN.startsWith('pk.your') ? (
                  <div className="flex items-center gap-2 h-64 justify-center text-sm text-[#9ca3af]">
                    <AlertCircle size={16} /> {t('map.mapUnavailable')}
                  </div>
                ) : (
                  <div ref={mapRef} className="h-64 sm:h-80 w-full rounded-lg overflow-hidden border border-[#e5e7eb] bg-[#0b1a12]" />
                )}
                <p className="text-xs text-[#9ca3af]">{t('fields.relocateHint')}</p>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="px-6 py-4 border-t border-[#f3f4f6] flex justify-end gap-2 bg-[#fafafa]">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={saving} icon={<Save size={15} />}>
              {t('map.saveChanges')}
            </Button>
          </div>

          <RadixDialog.Close className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors">
            <X size={15} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
