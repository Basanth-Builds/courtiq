import Link from 'next/link'
import { ChevronRight, Circle } from 'lucide-react'

const mockTournaments = [
  { id: '1', name: 'Summer Open 2026', status: 'live', date: 'Jun 24', courts: 8, participants: 64 },
  { id: '2', name: 'Club Championship', status: 'upcoming', date: 'Jun 28', courts: 4, participants: 32 },
  { id: '3', name: 'Mixed Doubles Cup', status: 'completed', date: 'Jun 20', courts: 6, participants: 48 },
]

export function TournamentList() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-surface-border">
        <h2 className="font-display font-semibold text-foreground">Tournaments</h2>
      </div>
      <div className="divide-y divide-surface-border">
        {mockTournaments.map((t) => (
          <Link
            key={t.id}
            href={`/tournament/${t.id}`}
            className="flex items-center justify-between p-5 hover:bg-surface-hover transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                t.status === 'live' ? 'bg-brand-green animate-pulse-green' :
                t.status === 'upcoming' ? 'bg-info' : 'bg-foreground-subtle'
              }`} />
              <div>
                <div className="font-medium text-foreground text-sm">{t.name}</div>
                <div className="text-foreground-muted text-xs mt-0.5">
                  {t.date} &middot; {t.courts} courts &middot; {t.participants} players
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-foreground-subtle group-hover:text-brand-green transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
