import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-[#e5e7eb] rounded-xl shadow-sm',
        hover && 'cursor-pointer transition-colors duration-150 hover:border-[#d1d5db] hover:bg-[#fafafa]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function CardHeader({ children, className, border = true }: CardHeaderProps) {
  return (
    <div className={cn('px-5 py-4', border && 'border-b border-[#f3f4f6]', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-3 border-t border-[#f3f4f6] bg-[#fafafa] rounded-b-xl', className)}>
      {children}
    </div>
  )
}
