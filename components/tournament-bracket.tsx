'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Match {
  id: string
  match_type: 'pool' | 'semifinal' | 'final'
  team1_number: number
  team2_number: number
  team1_name: string
  team2_name: string
  match_round?: number
  pool?: number
  status: 'pending' | 'live' | 'completed'
  scores?: { team1_score: number; team2_score: number }
}

interface TournamentBracketProps {
  tournamentId: string
}

export default function TournamentBracket({ tournamentId }: TournamentBracketProps) {
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const supabase = createClientComponentClient()

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('pool_matches')
        .select(`
          id,
          match_type,
          match_round,
          pool,
          status,
          scores,
          team1_id,
          team2_id,
          teams!pool_matches_team1_id_fkey(team_number, name),
          teams!pool_matches_team2_id_fkey(team_number, name)
        `)
        .eq('tournament_id', tournamentId)
        .order('match_type', { ascending: true })
        .order('pool', { ascending: true })
        .order('match_round', { ascending: true })

      if (error) throw error

      const transformedMatches = (data || []).map((match: {
        id: string
        match_type: string
        match_round?: number
        pool?: number
        status: string
        scores?: { team1_score: number; team2_score: number }
        teams: { team_number: number; name: string }[]
      }) => ({
        id: match.id,
        match_type: match.match_type as 'pool' | 'semifinal' | 'final',
        match_round: match.match_round,
        pool: match.pool,
        status: match.status as 'pending' | 'live' | 'completed',
        scores: match.scores,
        team1_number: match.teams[0].team_number,
        team2_number: match.teams[1].team_number,
        team1_name: match.teams[0].name,
        team2_name: match.teams[1].name,
      }))

      setMatches(transformedMatches)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load matches'
      console.error('Error fetching matches:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [tournamentId, supabase])

  useEffect(() => {
    fetchMatches()

    // Subscribe to match changes
    const subscription = supabase
      .channel(`matches:tournament_${tournamentId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pool_matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchMatches()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [tournamentId, supabase, fetchMatches])

  const poolMatches = matches.filter(m => m.match_type === 'pool')
  const semifinalMatches = matches.filter(m => m.match_type === 'semifinal')
  const finalMatches = matches.filter(m => m.match_type === 'final')

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className={`${
      match.status === 'live' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
      match.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
      'border-slate-200'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                match.status === 'live' ? 'default' :
                match.status === 'completed' ? 'secondary' :
                'outline'
              }
            >
              {match.status === 'pending' ? 'Pending' :
               match.status === 'live' ? 'LIVE' :
               'Completed'}
            </Badge>
            {match.match_round && <span className="text-xs text-muted-foreground">Round {match.match_round}</span>}
          </div>

          {/* Team 1 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">{match.team1_name}</span>
            <div className="text-lg font-bold">
              {match.scores?.team1_score ?? '—'}
            </div>
          </div>

          {/* VS */}
          <div className="text-center text-xs text-muted-foreground">vs</div>

          {/* Team 2 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">{match.team2_name}</span>
            <div className="text-lg font-bold">
              {match.scores?.team2_score ?? '—'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const MatchGrid = ({ matchList }: { matchList: Match[] }) => {
    if (matchList.length === 0) {
      return (
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
          <AlertCircle className="h-4 w-4" />
          <span>No matches generated yet</span>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchList.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
          <span>Loading bracket...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="pool" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pool">
          Pool Play ({poolMatches.length})
        </TabsTrigger>
        <TabsTrigger value="semifinal" disabled={semifinalMatches.length === 0}>
          Semifinals ({semifinalMatches.length})
        </TabsTrigger>
        <TabsTrigger value="final" disabled={finalMatches.length === 0}>
          Finals ({finalMatches.length})
        </TabsTrigger>
      </TabsList>

      {/* Pool Play Matches */}
      <TabsContent value="pool" className="space-y-6">
        {poolMatches.length === 0 ? (
          <Card>
            <CardContent className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No pool play matches yet. Generate matches to start.</span>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pool 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge>Pool 1</Badge>
                  Matches
                </CardTitle>
                <CardDescription>Teams 1, 2, 3</CardDescription>
              </CardHeader>
              <CardContent>
                <MatchGrid matchList={poolMatches.filter(m => m.pool === 1)} />
              </CardContent>
            </Card>

            {/* Pool 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Pool 2</Badge>
                  Matches
                </CardTitle>
                <CardDescription>Teams 4, 5, 6</CardDescription>
              </CardHeader>
              <CardContent>
                <MatchGrid matchList={poolMatches.filter(m => m.pool === 2)} />
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      {/* Semifinal Matches */}
      <TabsContent value="semifinal">
        <Card>
          <CardHeader>
            <CardTitle>Semifinals</CardTitle>
            <CardDescription>
              Pool 1 1st vs Pool 2 2nd | Pool 2 1st vs Pool 1 2nd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchGrid matchList={semifinalMatches} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Final Match */}
      <TabsContent value="final">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Final</CardTitle>
            <CardDescription>
              Winner of Semifinal 1 vs Winner of Semifinal 2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchGrid matchList={finalMatches} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Match Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{matches.filter(m => m.status === 'live').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{matches.filter(m => m.status === 'completed').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{matches.filter(m => m.status === 'pending').length}</div>
          </CardContent>
        </Card>
      </div>
    </Tabs>
  )
}
