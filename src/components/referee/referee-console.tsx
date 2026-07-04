'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const pendingMatches = [
  { id: 'M001', team1: 'Sharma / Patel', team2: 'Gupta / Singh', score: '11 - 7', court: 'Court 2', duprEligible: true },
  { id: 'M002', team1: 'Khan / Mehta', team2: 'Nair / Rao', score: '11 - 3', court: 'Court 4', duprEligible: false, reason: 'Score below DUPR minimum' },
  { id: 'M003', team1: 'Verma / Shah', team2: 'Joshi / Das', score: '11 - 9', court: 'Court 1', duprEligible: true },
]

export function RefereeConsole() {
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set())

  async function confirmMatch(id: string) {
    try {
      await fetch(`/api/matches/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'referee' }),
      })
      setConfirmed((prev) => new Set([...prev, id]))
      toast.success(`Match ${id} confirmed. Queued for DUPR export.`)
    } catch {
      toast.error('Failed to confirm. Try again.')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Referee Console</h1>
          <p className="text-foreground-muted mt-1">Review and confirm pending match results</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-green text-brand-slate-dark font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-green-light transition-colors text-sm">
          <Download size={16} />
          Export DUPR CSV
        </button>
      </div>

      <div className="space-y-4">
        {pendingMatches.map((match) => {
          const isConfirmed = confirmed.has(match.id)
          return (
            <div
              key={match.id}
              className={cn(
                'glass rounded-2xl p-5 transition-colors',
                isConfirmed && 'border-success/30 bg-success/5'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-foreground-muted text-xs font-medium">{match.court}</span>
                    <span className="text-foreground-subtle">·</span>
                    <span className="text-foreground-muted text-xs">{match.id}</span>
                    {!match.duprEligible && (
                      <span className="flex items-center gap-1 text-warning text-xs bg-warning/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} />
                        {match.reason}
                      </span>
                    )}
                  </div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {match.team1} <span className="text-brand-green mx-2">{match.score}</span> {match.team2}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      match.duprEligible ? 'bg-success/10 text-success' : 'bg-foreground-subtle/10 text-foreground-muted'
                    )}>
                      {match.duprEligible ? '✓ DUPR eligible' : '✗ DUPR excluded'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isConfirmed ? (
                    <button
                      onClick={() => confirmMatch(match.id)}
                      className="flex items-center gap-1.5 bg-success/10 text-success border border-success/20 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-success/20 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Confirm
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-success text-sm font-semibold">
                      <CheckCircle size={16} />
                      Confirmed
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
