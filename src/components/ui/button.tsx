import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-60 disabled:pointer-events-none',
          {
            'bg-brand-green text-brand-slate-dark hover:bg-brand-green-light': variant === 'default',
            'border border-surface-border text-foreground hover:bg-surface-hover': variant === 'outline',
            'text-foreground-muted hover:text-foreground hover:bg-surface-hover': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:opacity-90': variant === 'destructive',
          },
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-11 px-5 text-sm': size === 'md',
            'h-13 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
