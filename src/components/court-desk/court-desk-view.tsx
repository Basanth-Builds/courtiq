'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, CheckCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CourtDeskViewProps {
  matchId: string
}

type Team = 'team1' | 'team2'

export function CourtDeskView({ matchId }: CourtDeskViewProps) {
  const [scores, setScores] = useState({ team1: 0, team2: 0 })
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function adjustScore(team: Team, delta: number) {
    setScores((prev) => ({
      ...prev,
      [team]: Math.max(0, prev[team] + delta),
    }))
  }

  async function submitScore() {
    setSubmitting(true)
    try {
      await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scores),
      })
      setConfirmed(true)
      toast.success('Score submitted! Awaiting referee confirmation.')
    } catch {
      toast.error('Failed to submit score. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background court-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-foreground-muted text-sm">Match #{matchId}</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
              confirmed ? 'bg-success/10 text-success' : 'bg-brand-green/10 text-brand-green'
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', confirmed ? 'bg-success' : 'bg-brand-green animate-pulse')} />
              {confirmed ? 'Submitted' : 'In Progress'}
            </span>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 mb-4">
          <div className="grid grid-cols-2 gap-4">
            {(['team1', 'team2'] as Team[]).map((team, i) => (
              <div key={team} className="text-center">
                <div className="text-foreground-muted text-xs font-medium mb-4">
                  {i === 0 ? 'TEAM 1' : 'TEAM 2'}
                </div>
                <button
                  onClick={() => adjustScore(team, 1)}
                  disabled={confirmed}
                  className="w-full h-14 flex items-center justify-center bg-brand-green/10 hover:bg-brand-green/20 active:bg-brand-green/30 border border-brand-green/20 rounded-2xl transition-colors disabled:opacity-40"
                >
                  <ChevronUp size={24} className="text-brand-green" />
                </button>
                <div className={cn(
                  'font-display text-7xl font-bold my-4 transition-all',
                  'text-foreground'
                )}>
                  {scores[team]}
                </div>
                <button
                  onClick={() => adjustScore(team, -1)}
                  disabled={confirmed || scores[team] === 0}
                  className="w-full h-14 flex items-center justify-center bg-surface hover:bg-surface-hover border border-surface-border rounded-2xl transition-colors disabled:opacity-40"
                >
                  <ChevronDown size={24} className="text-foreground-muted" />
                </button>
              </div>
            ))}
          </div>

          {/* Divider with VS */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-foreground-subtle text-xs font-bold">VS</span>
          </div>
        </div>

        {!confirmed ? (
          <button
            onClick={submitScore}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-bold py-4 rounded-2xl text-base hover:bg-brand-green-light transition-colors active:scale-95 animate-pulse-green disabled:opacity-60"
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit score'}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-success py-4">
            <CheckCircle size={20} />
            <span className="font-semibold">Score sent to referee</span>
          </div>
        )}
      </div>
    </div>
  )
}
