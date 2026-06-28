import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  showTagline?: boolean
}

export function CourtIQLogo({ className, showTagline = false }: Props) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="flex items-center gap-2">
        <span className="font-display text-3xl font-bold text-brand-slate dark:text-white">
          Court
        </span>
        <span className="font-display text-3xl font-bold text-brand-green">IQ</span>
        <span className="text-2xl">🏓</span>
      </div>
      {showTagline && (
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          Score it live. Run it smart.
        </p>
      )}
    </div>
  )
}
