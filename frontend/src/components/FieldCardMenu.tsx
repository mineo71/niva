import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

export function FieldCardMenu({ onEdit, onDelete }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
    fn()
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
        aria-label={t('common.moreActions')}
        aria-expanded={open}
        className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-40 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 animate-fade-in">
          <button
            onClick={choose(onEdit)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors"
          >
            <Pencil size={14} className="text-[#6b7280]" />
            {t('common.edit')}
          </button>
          <button
            onClick={choose(onDelete)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
          >
            <Trash2 size={14} />
            {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  )
}
