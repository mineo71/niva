import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-lg bg-white border border-[#e5e7eb] rounded-2xl',
            'shadow-xl shadow-black/10',
            'data-[state=open]:animate-fade-in outline-none',
            className
          )}
        >
          {(title || description) && (
            <div className="px-6 py-5 border-b border-[#f3f4f6]">
              {title && (
                <RadixDialog.Title className="text-base font-semibold text-[#111827] tracking-tight">
                  {title}
                </RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-[#6b7280]">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
          )}
          <div className="px-6 py-5">{children}</div>
          <RadixDialog.Close className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors">
            <X size={15} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
