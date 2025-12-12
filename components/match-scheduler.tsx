'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Zap, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface Team {
  id: string
  team_number: number
  pool: number
}

interface MatchSchedulerProps {
  tournamentId: string
  teams: Team[]
  onMatchesGenerated?: (matchCount: number) => void
}

export default function MatchScheduler({ tournamentId, teams, onMatchesGenerated }: MatchSchedulerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedMatches, setGeneratedMatches] = useState<number>(0)
  const supabase = createClientComponentClient()

  const generateRoundRobinMatches = async () => {
    setLoading(true)
    try {
      // Group teams by pool
      const pool1Teams = teams.filter(t => t.pool === 1)
      const pool2Teams = teams.filter(t => t.pool === 2)

      // Generate matches for each pool
      const allMatches = []

      // Pool 1 matches
      for (let round = 1; round <= 2; round++) {
        for (let i = 0; i < pool1Teams.length; i++) {
          for (let j = i + 1; j < pool1Teams.length; j++) {
            allMatches.push({
              tournament_id: tournamentId,
              team1_id: pool1Teams[i].id,
              team2_id: pool1Teams[j].id,
              pool: 1,
              match_type: 'pool',
              match_round: round,
              status: 'pending',
              scores: { team1_score: null, team2_score: null },
            })
          }
        }
      }

      // Pool 2 matches
      for (let round = 1; round <= 2; round++) {
        for (let i = 0; i < pool2Teams.length; i++) {
          for (let j = i + 1; j < pool2Teams.length; j++) {
            allMatches.push({
              tournament_id: tournamentId,
              team1_id: pool2Teams[i].id,
              team2_id: pool2Teams[j].id,
              pool: 2,
              match_type: 'pool',
              match_round: round,
              status: 'pending',
              scores: { team1_score: null, team2_score: null },
            })
          }
        }
      }

      // Check if matches already exist for this tournament
      const { data: existingMatches } = await supabase
        .from('pool_matches')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('match_type', 'pool')

      if (existingMatches && existingMatches.length > 0) {
        toast.error('Pool matches already generated for this tournament')
        setLoading(false)
        return
      }

      // Insert all matches
      const { data, error } = await supabase
        .from('pool_matches')
        .insert(allMatches)
        .select('id')

      if (error) throw error

      const matchCount = data?.length || 0
      setGeneratedMatches(matchCount)

      toast.success(`Generated ${matchCount} pool play matches`)
      onMatchesGenerated?.(matchCount)

      // Close dialog after success
      setTimeout(() => setOpen(false), 1000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate matches'
      console.error('Error generating matches:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const matchCount = (() => {
    const pool1Teams = teams.filter(t => t.pool === 1).length
    const pool2Teams = teams.filter(t => t.pool === 2).length

    // Each pool: n teams, each plays each other twice = n * (n-1) matches
    const pool1Matches = pool1Teams * (pool1Teams - 1)
    const pool2Matches = pool2Teams * (pool2Teams - 1)

    return pool1Matches + pool2Matches
  })()

  const canGenerate = teams.length === 6 && matchCount > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Zap className="h-4 w-4" />
          Generate Matches
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Pool Play Matches</DialogTitle>
          <DialogDescription>
            Auto-generate round-robin matches for pool play
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pool 1 (Teams 1-3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const pool1Teams = teams.filter(t => t.pool === 1).length
                    return pool1Teams * (pool1Teams - 1)
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  matches (each team plays 4 times)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pool 2 (Teams 4-6)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const pool2Teams = teams.filter(t => t.pool === 2).length
                    return pool2Teams * (pool2Teams - 1)
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  matches (each team plays 4 times)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Algorithm Explanation */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Round-Robin Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                Each team in a pool plays every other team <strong>2 times</strong> (different round):
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Pool 1: Team 1 vs 2, Team 1 vs 3, Team 2 vs 3 (Round 1)</li>
                <li>Pool 1: Team 2 vs 1, Team 3 vs 1, Team 3 vs 2 (Round 2)</li>
                <li>Pool 2: Same pattern with Teams 4, 5, 6</li>
              </ul>
              <p className="text-xs mt-3">
                Total: <strong>{matchCount} matches</strong>
              </p>
            </CardContent>
          </Card>

          {/* Match Distribution */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-sm">
            <div className="font-semibold mb-3">Match Distribution</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted-foreground mb-1">Each team plays:</div>
                <div className="font-bold text-lg">4 matches</div>
                <div className="text-xs text-muted-foreground">(2 opponents × 2 rounds)</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total matches:</div>
                <div className="font-bold text-lg">{matchCount}</div>
                <div className="text-xs text-muted-foreground">(both pools combined)</div>
              </div>
            </div>
          </div>

          {/* Success State */}
          {generatedMatches > 0 && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    ✓ {generatedMatches} matches generated successfully
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-200">
                    Next: Create standings and knockout bracket
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={generateRoundRobinMatches}
              disabled={!canGenerate || loading || generatedMatches > 0}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Generating...' : `Generate ${matchCount} Matches`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
