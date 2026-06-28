import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#0d1a14] border border-[#1e3022] rounded-xl overflow-hidden',
        hover && 'cursor-pointer transition-all duration-200 hover:border-[#2d4a34] hover:bg-[#112018]',
        glow && 'animate-pulse-glow',
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
    <div
      className={cn(
        'px-5 py-4',
        border && 'border-b border-[#1e3022]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-3 border-t border-[#1e3022] bg-[#0a1410]', className)}>
      {children}
    </div>
  )
}
