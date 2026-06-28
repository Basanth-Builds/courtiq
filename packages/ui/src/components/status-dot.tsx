import { cn } from '../lib/utils'
import type { MatchStatus } from '@court-iq/types'

const statusConfig: Record<MatchStatus, { color: string; pulse: boolean; label: string }> = {
  scheduled: { color: 'bg-foreground-subtle', pulse: false, label: 'Scheduled' },
  in_progress: { color: 'bg-brand-green', pulse: true, label: 'Live' },
  pending_umpire: { color: 'bg-warning', pulse: false, label: 'Pending Umpire' },
  pending_referee: { color: 'bg-info', pulse: false, label: 'Pending Referee' },
  confirmed: { color: 'bg-success', pulse: false, label: 'Confirmed' },
  dupr_submitted: { color: 'bg-brand-green', pulse: false, label: 'DUPR Submitted' },
  dupr_excluded: { color: 'bg-foreground-subtle', pulse: false, label: 'DUPR Excluded' },
}

export function StatusDot({ status, showLabel = false }: { status: MatchStatus; showLabel?: boolean }) {
  const config = statusConfig[status]
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', config.color, config.pulse && 'animate-pulse')} />
      {showLabel && <span className="text-xs font-medium text-foreground-muted">{config.label}</span>}
    </span>
  )
}
