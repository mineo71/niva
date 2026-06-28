import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border border-[#e5e7eb] rounded-xl p-5 space-y-3 shadow-sm', className)}>
      <Skeleton height={14} className="w-1/3" />
      <Skeleton height={22} className="w-2/3" />
      <Skeleton height={12} className="w-full" />
      <Skeleton height={12} className="w-4/5" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          className={i === lines - 1 ? 'w-3/5' : 'w-full'}
        />
      ))}
    </div>
  )
}
