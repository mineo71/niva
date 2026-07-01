import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, ArrowRight, Search, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fieldsApi } from '@/api/fields'
import type { FieldResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Dialog } from '@/components/ui/Dialog'
import { NDVIChip } from '@/components/NDVIColorScale'
import { Sparkline } from '@/components/Sparkline'
import { CropIcon } from '@/components/CropIcon'
import { Onboarding } from '@/components/Onboarding'
import { FieldCardMenu } from '@/components/FieldCardMenu'
import { EditFieldModal } from '@/components/EditFieldModal'
import { fieldPreviewUrl } from '@/lib/mapPreview'
import { ndviToHex } from '@/lib/ndvi'
import {
  formatArea, formatDate, formatRelativeTime, isStale,
} from '@/lib/utils'

type SortKey = 'newest' | 'name' | 'area' | 'ndvi'

// ── Inline stale / freshness label ────────────────────────────────────────────
function NdviTimestamp({ updatedAt }: { updatedAt: string | null }) {
  const { t, i18n } = useTranslation()
  if (!updatedAt) return null
  const stale = isStale(updatedAt)
  const rel = formatRelativeTime(updatedAt, i18n.language)

  if (stale) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-[#d97706] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
        {t('fields.stale')}
        <span className="text-[#9ca3af] font-normal">· {rel}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-[#9ca3af]">
      <Clock size={9} className="shrink-0" />
      {t('fields.updatedAgo', { rel })}
    </span>
  )
}

// ── Fields page ───────────────────────────────────────────────────────────────
export function Fields() {
  const { t, i18n } = useTranslation()

  const [fields, setFields] = useState<FieldResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [cropFilter, setCropFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editField, setEditField] = useState<FieldResponse | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setFields(await fieldsApi.list())
    } catch {
      toast.error(t('fields.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  // crop options present in the user's fields (for the filter dropdown)
  const cropsPresent = Array.from(new Set(fields.map((f) => f.crop_type)))
  const cropOptions = [
    { value: 'all', label: t('fields.filterAllCrops') },
    ...cropsPresent.map((c) => ({ value: c, label: t(`crops.${c}`, { defaultValue: c }) })),
  ]
  const sortOptions = [
    { value: 'newest', label: t('fields.sortNewest') },
    { value: 'name', label: t('fields.sortName') },
    { value: 'area', label: t('fields.sortAreaDesc') },
    { value: 'ndvi', label: t('fields.sortNdviDesc') },
  ]

  const filtered = fields
    .filter((f) =>
      (cropFilter === 'all' || f.crop_type === cropFilter) &&
      (f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.crop_type.includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'area': return b.area_ha - a.area_ha
        case 'ndvi': return (b.latest_ndvi ?? -1) - (a.latest_ndvi ?? -1)
        default: return b.created_at.localeCompare(a.created_at) // newest
      }
    })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fieldsApi.delete(deleteId)
      setFields((prev) => prev.filter((f) => f.id !== deleteId))
      toast.success(t('fields.deleteSuccess'))
    } catch {
      toast.error(t('fields.deleteError'))
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const fieldToDelete = fields.find((f) => f.id === deleteId)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-xl text-[#111827] tracking-tight">
            {t('fields.title')}
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {t('fields.found', { count: fields.length })}
          </p>
        </div>
        <Link to="/dashboard/map" className="hidden sm:block">
          <Button size="sm" icon={<Plus size={14} />}>
            {t('fields.new')}
          </Button>
        </Link>
      </div>

      {/* Toolbar: search + filter + sort */}
      {!loading && fields.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Input
            placeholder={t('fields.searchPlaceholder')}
            leftIcon={<Search size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-56"
          />
          <div className="flex items-center gap-2">
            <Select
              value={cropFilter}
              onValueChange={setCropFilter}
              options={cropOptions}
              className="flex-1 sm:flex-none sm:w-40"
            />
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
              options={sortOptions}
              placeholder={t('fields.sortBy')}
              className="flex-1 sm:flex-none sm:w-48"
            />
          </div>
          <Link to="/dashboard/map" className="sm:hidden">
            <Button size="sm" icon={<Plus size={14} />} className="w-full">
              {t('fields.new')}
            </Button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !fields.length ? (
        <Onboarding />
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#9ca3af]">
          <MapPin size={40} className="mb-4 opacity-30" />
          <p className="text-sm font-medium text-[#6b7280] mb-1">
            {t('fields.noFieldsFound')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((field) => {
            const hasTrend   = field.ndvi_trend.length >= 2
            const hasNdvi    = field.latest_ndvi != null
            const stale      = isStale(field.ndvi_updated_at)
            const previewUrl = fieldPreviewUrl(field)

            return (
              <Card key={field.id} hover className="group overflow-hidden">
                {previewUrl && (
                  <Link to={`/dashboard/fields/${field.id}`} className="block relative h-32 bg-[#f3f4f6]">
                    <img
                      src={previewUrl}
                      alt={field.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {hasNdvi && (
                      <div className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 shadow-md ring-1 ring-black/10">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: ndviToHex(field.latest_ndvi!) }}
                        />
                        <span className="text-xs font-bold text-[#111827] tabular-nums">
                          {field.latest_ndvi!.toFixed(3)}
                        </span>
                      </div>
                    )}
                  </Link>
                )}
                <CardBody className="flex flex-col gap-3">
                  {/* ── Top row: crop icon + name + actions ── */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center shrink-0">
                        <CropIcon crop={field.crop_type} size={18} className="text-[#16a34a]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-[#111827] leading-tight truncate">
                          {field.name}
                        </h3>
                        <p className="text-xs text-[#9ca3af] mt-0.5 truncate">
                          {t(`crops.${field.crop_type}`, { defaultValue: field.crop_type })}
                        </p>
                      </div>
                    </div>
                    {/* Action menu */}
                    <FieldCardMenu
                      onEdit={() => setEditField(field)}
                      onDelete={() => setDeleteId(field.id)}
                    />
                  </div>

                  {/* ── Area + Soil stats ── */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f9fafb] rounded-lg px-3 py-2 border border-[#f3f4f6]">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-0.5">
                        {t('fields.area')}
                      </p>
                      <p className="text-sm font-semibold text-[#16a34a] tabular-nums">
                        {formatArea(field.area_ha, i18n.language)}
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] rounded-lg px-3 py-2 border border-[#f3f4f6]">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-0.5">
                        {t('fields.soil_label')}
                      </p>
                      <p className="text-sm font-medium text-[#374151]">
                        {t(`soils.${field.soil_type}`, { defaultValue: field.soil_type })}
                      </p>
                    </div>
                  </div>

                  {/* ── NDVI row: sparkline + chip + timestamp ── */}
                  {(hasNdvi || hasTrend) && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#f3f4f6]">
                      {hasTrend && (
                        <Sparkline
                          values={field.ndvi_trend}
                          width={72}
                          height={22}
                          color={stale ? '#d97706' : '#16a34a'}
                        />
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        {hasNdvi && (
                          <NDVIChip value={field.latest_ndvi!} />
                        )}
                        <NdviTimestamp updatedAt={field.ndvi_updated_at} />
                      </div>
                    </div>
                  )}

                  {/* ── Footer ── */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#f3f4f6]">
                    <Badge variant="neutral" className="text-[10px]">
                      {formatDate(field.created_at, i18n.language)}
                    </Badge>
                    <Link
                      to={`/dashboard/fields/${field.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] hover:bg-[#dcfce7] hover:border-[#86efac] transition-colors cursor-pointer"
                    >
                      {t('fields.details')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete confirm */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('fields.deleteTitle')}
        description={t('fields.deleteDesc', { name: fieldToDelete?.name ?? '' })}
      >
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            {t('common.delete')}
          </Button>
        </div>
      </Dialog>

      {/* Edit field (multi-tab modal) */}
      {editField && (
        <EditFieldModal
          field={editField}
          open={!!editField}
          onOpenChange={(o) => !o && setEditField(null)}
          onSaved={(updated) => {
            setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
            setEditField(null)
          }}
        />
      )}
    </div>
  )
}
