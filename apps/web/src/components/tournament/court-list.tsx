import Link from 'next/link'
import { Gavel } from 'lucide-react'

const courts = [
  { id: 'C1', name: 'Court 1', match: 'M001', status: 'live' },
  { id: 'C2', name: 'Court 2', match: 'M002', status: 'completed' },
  { id: 'C3', name: 'Court 3', match: 'M003', status: 'live' },
  { id: 'C4', name: 'Court 4', match: null, status: 'idle' },
]

export function CourtList({ tournamentId }: { tournamentId: string }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground">Courts</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {courts.map((court) => (
          <Link
            key={court.id}
            href={court.match ? `/court-desk/${court.match}` : '#'}
            className={`glass rounded-2xl p-4 text-center hover:border-brand-green/30 transition-colors ${
              court.status === 'live' ? 'border-brand-green/30' : ''
            }`}
          >
            <Gavel size={20} className={`mx-auto mb-2 ${
              court.status === 'live' ? 'text-brand-green' : 'text-foreground-muted'
            }`} />
            <div className="font-display font-bold text-foreground text-sm">{court.name}</div>
            <div className={`text-xs mt-1 ${
              court.status === 'live' ? 'text-brand-green' :
              court.status === 'completed' ? 'text-success' : 'text-foreground-muted'
            }`}>
              {court.status === 'live' ? '● Live' : court.status === 'completed' ? 'Completed' : 'Idle'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
