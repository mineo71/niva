import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Pencil, Trash2, ArrowRight, Search } from 'lucide-react'
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
import {
  formatArea, formatDate,
  CROP_LABELS_UK, CROP_LABELS_EN, CROP_ICONS,
  SOIL_LABELS_UK, SOIL_LABELS_EN,
} from '@/lib/utils'

export function Fields() {
  const { i18n } = useTranslation()
  const isUk = i18n.language === 'uk'

  const [fields, setFields] = useState<FieldResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fieldsApi.list()
      setFields(data)
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
          {filtered.map((field) => (
            <Card key={field.id} hover className="group">
              <CardBody>
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center text-lg shrink-0">
                      {CROP_ICONS[field.crop_type as keyof typeof CROP_ICONS]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#111827] leading-tight line-clamp-1">
                        {field.name}
                      </h3>
                      <p className="text-xs text-[#9ca3af] mt-0.5">
                        {isUk
                          ? CROP_LABELS_UK[field.crop_type as keyof typeof CROP_LABELS_UK] ?? field.crop_type
                          : CROP_LABELS_EN[field.crop_type as keyof typeof CROP_LABELS_EN] ?? field.crop_type}
                      </p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
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

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6]">
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
          ))}
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
