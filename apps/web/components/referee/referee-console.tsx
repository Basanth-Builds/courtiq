'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'

interface PendingResult {
  matchId: string
  team1: string
  team2: string
  score: string
  submittedBy: string
  duprEligible: boolean
  warnings: string[]
}

const mockPending: PendingResult[] = [
  {
    matchId: 'match-001',
    team1: 'Team Alpha',
    team2: 'Team Beta',
    score: '11 – 7',
    submittedBy: 'Umpire Raj',
    duprEligible: true,
    warnings: [],
  },
  {
    matchId: 'match-002',
    team1: 'Team Gamma',
    team2: 'Team Delta',
    score: '5 – 4',
    submittedBy: 'Umpire Priya',
    duprEligible: false,
    warnings: ['Score below DUPR minimum (6 points required)'],
  },
]

export function RefereeConsole() {
  const [results, setResults] = useState(mockPending)

  async function handleConfirm(matchId: string) {
    setResults((prev) => prev.filter((r) => r.matchId !== matchId))
    toast.success('Result confirmed — DUPR CSV queued')
  }

  async function handleReject(matchId: string) {
    setResults((prev) => prev.filter((r) => r.matchId !== matchId))
    toast.error('Result rejected — umpire notified')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-brand-green" />
        <h1 className="text-2xl font-bold">Referee Console</h1>
        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
          {results.length} pending
        </Badge>
      </div>

      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mb-3 text-brand-green/50" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending results to review.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <Card
            key={result.matchId}
            className={`border ${
              result.warnings.length > 0 ? 'border-yellow-500/30' : 'border-border/50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {result.team1} vs {result.team2}
                </CardTitle>
                <Badge
                  variant={result.duprEligible ? 'default' : 'secondary'}
                  className={result.duprEligible ? 'bg-brand-green/20 text-brand-green' : ''}
                >
                  {result.duprEligible ? 'DUPR eligible' : 'Not DUPR eligible'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold tabular-nums">{result.score}</span>
              </div>
              <p className="text-xs text-muted-foreground">Submitted by {result.submittedBy}</p>

              {result.warnings.map((w) => (
                <div
                  key={w}
                  className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-yellow-400 text-xs"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {w}
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleReject(result.matchId)}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-brand-green text-brand-slate hover:bg-brand-green-light font-semibold"
                  onClick={() => handleConfirm(result.matchId)}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
