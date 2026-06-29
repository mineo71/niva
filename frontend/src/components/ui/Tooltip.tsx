import * as RT from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
}

/** Accessible tooltip (Radix). Wrap any focusable/hoverable element. */
export function Tooltip({ content, children, side = 'top', delay = 200 }: TooltipProps) {
  if (!content) return <>{children}</>
  return (
    <RT.Root delayDuration={delay}>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-[240px] rounded-lg bg-[#111827] px-2.5 py-1.5 text-xs font-medium text-white shadow-md
            select-none data-[state=delayed-open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0"
        >
          {content}
          <RT.Arrow className="fill-[#111827]" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  )
}
