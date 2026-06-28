'use client'

import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

const mockLiveMatches = [
  { id: 'M001', court: 'Court 1', team1: 'Sharma / Patel', team2: 'Gupta / Singh', score1: 7, score2: 5, status: 'live' },
  { id: 'M002', court: 'Court 2', team1: 'Khan / Mehta', team2: 'Nair / Rao', score1: 11, score2: 3, status: 'completed' },
  { id: 'M003', court: 'Court 3', team1: 'Verma / Shah', team2: 'Joshi / Das', score1: 4, score2: 4, status: 'live' },
  { id: 'M004', court: 'Court 4', team1: 'Tiwari / Bose', team2: 'Iyer / Pillai', score1: 0, score2: 0, status: 'scheduled' },
]

export function LiveScoreboard({ tournamentId }: { tournamentId: string }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background-secondary p-4 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          <span className="text-brand-green text-sm font-semibold">LIVE</span>
          <span className="text-foreground-muted text-sm ml-2">{time.toLocaleTimeString()}</span>
        </div>
      </header>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Live Scores</h1>
        <div className="grid gap-4">
          {mockLiveMatches.map((match) => (
            <div key={match.id} className={cn(
              'glass rounded-2xl p-5',
              match.status === 'live' && 'border-brand-green/30'
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-foreground-muted text-xs">{match.court}</span>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  match.status === 'live' ? 'bg-brand-green/10 text-brand-green' :
                  match.status === 'completed' ? 'bg-success/10 text-success' : 'bg-surface text-foreground-muted'
                )}>
                  {match.status === 'live' ? '● LIVE' : match.status === 'completed' ? 'Final' : 'Upcoming'}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-right">
                  <div className="font-display font-bold text-foreground">{match.team1}</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-4xl font-bold text-foreground">
                    <span className={match.score1 > match.score2 ? 'text-brand-green' : ''}>{match.score1}</span>
                    <span className="text-foreground-muted mx-2">-</span>
                    <span className={match.score2 > match.score1 ? 'text-brand-green' : ''}>{match.score2}</span>
                  </div>
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">{match.team2}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
