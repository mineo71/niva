import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Pencil, Trash2, ArrowRight, Search, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fieldsApi } from '@/api/fields'
import type { FieldResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Dialog } from '@/components/ui/Dialog'
import { NDVIChip } from '@/components/NDVIColorScale'
import { Sparkline } from '@/components/Sparkline'
import { CropIcon } from '@/components/CropIcon'
import {
  formatArea, formatDate, formatRelativeTime, isStale,
  CROP_LABELS_UK, CROP_LABELS_EN,
  SOIL_LABELS_UK, SOIL_LABELS_EN,
} from '@/lib/utils'

// ── Inline stale / freshness label ────────────────────────────────────────────
function NdviTimestamp({
  updatedAt,
  lang,
}: {
  updatedAt: string | null
  lang: 'uk' | 'en'
}) {
  if (!updatedAt) return null
  const stale = isStale(updatedAt)
  const rel   = formatRelativeTime(updatedAt, lang)

  if (stale) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-[#d97706] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
        {lang === 'uk' ? 'застаріло' : 'stale'}
        <span className="text-[#9ca3af] font-normal">· {rel}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-[#9ca3af]">
      <Clock size={9} className="shrink-0" />
      {lang === 'uk' ? `оновлено ${rel}` : `updated ${rel}`}
    </span>
  )
}

// ── Fields page ───────────────────────────────────────────────────────────────
export function Fields() {
  const { i18n } = useTranslation()
  const isUk = i18n.language === 'uk'
  const lang  = i18n.language as 'uk' | 'en'

  const [fields, setFields] = useState<FieldResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setFields(await fieldsApi.list())
    } catch {
      toast.error(isUk ? 'Помилка завантаження полів' : 'Failed to load fields')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const filtered = fields.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.crop_type.includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fieldsApi.delete(deleteId)
      setFields((prev) => prev.filter((f) => f.id !== deleteId))
      toast.success(isUk ? 'Поле видалено' : 'Field deleted')
    } catch {
      toast.error(isUk ? 'Помилка видалення' : 'Delete failed')
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
            {isUk ? 'Мої поля' : 'My Fields'}
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {isUk ? `${fields.length} полів знайдено` : `${fields.length} fields found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={isUk ? 'Пошук полів...' : 'Search fields...'}
            leftIcon={<Search size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-52"
          />
          <Link to="/dashboard/map">
            <Button size="sm" icon={<Plus size={14} />}>
              {isUk ? 'Нове поле' : 'New field'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#9ca3af]">
          <MapPin size={40} className="mb-4 opacity-30" />
          <p className="text-sm font-medium text-[#6b7280] mb-1">
            {search
              ? isUk ? 'Поля не знайдено' : 'No fields found'
              : isUk ? 'Полів ще немає' : 'No fields yet'}
          </p>
          {!search && (
            <Link to="/dashboard/map">
              <Button size="sm" variant="secondary" icon={<Plus size={13} />} className="mt-3">
                {isUk ? 'Додати перше поле' : 'Add first field'}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((field) => {
            const hasTrend   = field.ndvi_trend.length >= 2
            const hasNdvi    = field.latest_ndvi != null
            const stale      = isStale(field.ndvi_updated_at)

            return (
              <Card key={field.id} hover className="group">
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
                          {isUk
                            ? CROP_LABELS_UK[field.crop_type as keyof typeof CROP_LABELS_UK] ?? field.crop_type
                            : CROP_LABELS_EN[field.crop_type as keyof typeof CROP_LABELS_EN] ?? field.crop_type}
                        </p>
                      </div>
                    </div>
                    {/* Action buttons — appear on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                      <Link
                        to={`/dashboard/map/${field.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title={isUk ? 'Редагувати' : 'Edit'}
                        className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#16a34a] hover:bg-[#f0fdf4] transition-colors"
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(field.id) }}
                        title={isUk ? 'Видалити' : 'Delete'}
                        className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* ── Area + Soil stats ── */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f9fafb] rounded-lg px-3 py-2 border border-[#f3f4f6]">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-0.5">
                        {isUk ? 'Площа' : 'Area'}
                      </p>
                      <p className="text-sm font-semibold text-[#16a34a] tabular-nums">
                        {formatArea(field.area_ha)}
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] rounded-lg px-3 py-2 border border-[#f3f4f6]">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wide mb-0.5">
                        {isUk ? 'Ґрунт' : 'Soil'}
                      </p>
                      <p className="text-sm font-medium text-[#374151]">
                        {isUk
                          ? SOIL_LABELS_UK[field.soil_type as keyof typeof SOIL_LABELS_UK] ?? field.soil_type
                          : SOIL_LABELS_EN[field.soil_type as keyof typeof SOIL_LABELS_EN] ?? field.soil_type}
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
                        <NdviTimestamp updatedAt={field.ndvi_updated_at} lang={lang} />
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
                      className="flex items-center gap-1 text-xs text-[#16a34a] hover:text-[#15803d] transition-colors font-medium"
                    >
                      {isUk ? 'Детальніше' : 'Details'} <ArrowRight size={11} />
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
        title={isUk ? 'Видалити поле?' : 'Delete field?'}
        description={
          isUk
            ? `Це назавжди видалить поле "${fieldToDelete?.name ?? ''}". Дію не можна скасувати.`
            : `This will permanently delete field "${fieldToDelete?.name ?? ''}". This cannot be undone.`
        }
      >
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
            {isUk ? 'Скасувати' : 'Cancel'}
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            {isUk ? 'Видалити' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
