import { Trophy, Users, Calendar } from 'lucide-react'

export function TournamentHeader({ tournamentId }: { tournamentId: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            <span className="text-brand-green text-xs font-semibold">LIVE</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Summer Open 2026</h1>
          <p className="text-foreground-muted mt-1">Tournament ID: {tournamentId}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-brand-green">64</div>
            <div className="text-foreground-muted text-xs flex items-center gap-1"><Users size={10} /> Players</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-brand-green">8</div>
            <div className="text-foreground-muted text-xs">Courts</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-brand-green">24</div>
            <div className="text-foreground-muted text-xs">Matches</div>
          </div>
        </div>
      </div>
    </div>
  )
}
