import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Оберіть...',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          className={cn(
            'w-full flex items-center justify-between h-9 px-3 rounded-lg text-sm',
            'bg-white border border-[#e5e7eb] text-[#111827]',
            'transition-colors duration-150 outline-none',
            'hover:border-[#d1d5db]',
            'focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15',
            'data-[placeholder]:text-[#9ca3af]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#dc2626]'
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={15} className="text-[#9ca3af]" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-xl bg-white border border-[#e5e7eb] shadow-lg shadow-black/8"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'relative flex items-center gap-2 h-8 px-3 pr-8 rounded-lg text-sm text-[#111827]',
                    'cursor-pointer select-none outline-none',
                    'data-[highlighted]:bg-[#f9fafb] data-[highlighted]:text-[#16a34a]',
                    'data-[state=checked]:text-[#16a34a] data-[state=checked]:font-medium'
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2 text-[#16a34a]">
                    <Check size={14} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  )
}
