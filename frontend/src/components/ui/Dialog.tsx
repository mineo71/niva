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
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-lg bg-[#0d1a14] border border-[#2d4a34] rounded-2xl shadow-2xl shadow-black/60',
            'data-[state=open]:animate-fade-in',
            'outline-none',
            className
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-5 border-b border-[#1e3022]">
              {title && (
                <RadixDialog.Title className="text-lg font-semibold text-[#f0f4f1] font-display">
                  {title}
                </RadixDialog.Title>
              )}
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-[#6b9e78]">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5">{children}</div>

          {/* Close button */}
          <RadixDialog.Close className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6b9e78] hover:text-[#f0f4f1] hover:bg-[#112018] transition-colors">
            <X size={16} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
