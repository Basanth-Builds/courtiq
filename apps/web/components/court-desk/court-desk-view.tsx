'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Minus, Plus, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  matchId: string
}

export function CourtDeskView({ matchId }: Props) {
  const [scores, setScores] = useState({ team1: 0, team2: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function adjust(team: 'team1' | 'team2', delta: number) {
    setScores((prev) => ({
      ...prev,
      [team]: Math.max(0, prev[team] + delta),
    }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1Score: scores.team1,
          team2Score: scores.team2,
          status: 'provisional',
        }),
      })
      setSubmitted(true)
      toast.success('Score submitted — pending referee confirmation')
    } catch {
      toast.error('Failed to submit score. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-slate p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <Badge className="bg-brand-green/20 text-brand-green border-brand-green/30">
            🏓 Court Desk
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-white">Match #{matchId.slice(0, 8)}</h1>
          <p className="text-sm text-gray-400">Enter the final score below</p>
        </div>

        {/* Score Card */}
        <Card className="bg-brand-slate-light border-white/10">
          <CardContent className="p-6 space-y-6">
            {(['team1', 'team2'] as const).map((team, i) => (
              <div key={team}>
                <p className="mb-3 text-center text-sm font-medium text-gray-400">
                  Team {i + 1}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-2xl border-white/20 text-white hover:bg-white/10"
                    onClick={() => adjust(team, -1)}
                  >
                    <Minus className="h-6 w-6" />
                  </Button>

                  <motion.span
                    key={scores[team]}
                    initial={{ scale: 1.4, color: '#A8D634' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.25 }}
                    className="text-7xl font-bold tabular-nums"
                  >
                    {scores[team]}
                  </motion.span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-2xl border-brand-green/40 bg-brand-green/10 text-brand-green hover:bg-brand-green/20"
                    onClick={() => adjust(team, 1)}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        {!submitted ? (
          <Button
            className="w-full h-14 bg-brand-green text-brand-slate font-bold text-base hover:bg-brand-green-light"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Send className="mr-2 h-5 w-5" />
            {submitting ? 'Submitting…' : 'Submit Score'}
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-green/10 border border-brand-green/30 p-4 text-brand-green">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Awaiting referee confirmation</span>
          </div>
        )}
      </div>
    </div>
  )
}
