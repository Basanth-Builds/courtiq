import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <div className={cn('flex items-center gap-1 font-display font-bold', sizes[size], className)}>
      <span className="text-foreground">Court</span>
      <span className="text-brand-green">IQ</span>
      <span className="text-brand-green text-xs -mt-2">●</span>
    </div>
  )
}
