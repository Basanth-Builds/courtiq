import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-brand-green/20 text-brand-green border border-brand-green/30': variant === 'default',
          'bg-surface text-foreground-muted border border-surface-border': variant === 'secondary',
          'bg-destructive/20 text-destructive border border-destructive/30': variant === 'destructive',
          'border border-surface-border text-foreground-muted': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
