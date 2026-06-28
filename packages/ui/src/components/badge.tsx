import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-court-green/20 text-court-green',
        secondary: 'border-transparent bg-white/10 text-gray-300',
        destructive: 'border-transparent bg-red-500/20 text-red-400',
        outline: 'border-court-green/30 text-court-green',
        // Match status badges
        scheduled: 'border-transparent bg-blue-500/20 text-blue-400',
        in_progress: 'border-transparent bg-yellow-500/20 text-yellow-400 animate-pulse',
        pending_review: 'border-transparent bg-orange-500/20 text-orange-400',
        confirmed: 'border-transparent bg-court-green/20 text-court-green',
        disputed: 'border-transparent bg-red-500/20 text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
