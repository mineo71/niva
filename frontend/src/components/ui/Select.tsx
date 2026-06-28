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
        <label className="text-xs font-medium text-[#6b9e78] uppercase tracking-wider font-display">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          className={cn(
            'w-full flex items-center justify-between h-10 px-3 rounded-lg text-sm',
            'bg-[#0a1410] border border-[#1e3022] text-[#f0f4f1] font-sans',
            'transition-all duration-200 outline-none',
            'hover:border-[#2d4a34]',
            'focus:border-[#4ade80]/60 focus:shadow-[0_0_0_2px_rgba(74,222,128,0.12)]',
            'data-[placeholder]:text-[#3d7050]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#ef4444]/50'
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={16} className="text-[#6b9e78]" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-lg bg-[#0d1a14] border border-[#2d4a34] shadow-xl shadow-black/50"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'relative flex items-center gap-2 h-9 px-3 pr-8 rounded-md text-sm text-[#f0f4f1] font-sans',
                    'cursor-pointer select-none outline-none',
                    'data-[highlighted]:bg-[#112018] data-[highlighted]:text-[#4ade80]',
                    'data-[state=checked]:text-[#4ade80]'
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2">
                    <Check size={14} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
}
