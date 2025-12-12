'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, Trophy, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Ranking {
  rank: number
  pool: number
  team_number: number
  team_name: string
  matches_played: number
  wins: number
  losses: number
  total_points_for: number
  total_points_against: number
  point_differential: number
}

interface PoolStandingsProps {
  tournamentId: string
}

export default function PoolStandings({ tournamentId }: PoolStandingsProps) {
  const [loading, setLoading] = useState(true)
  const [pool1Rankings, setPool1Rankings] = useState<Ranking[]>([])
  const [pool2Rankings, setPool2Rankings] = useState<Ranking[]>([])
  const supabase = createClientComponentClient()

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch standings with team info
      const { data: standings, error } = await supabase
        .from('pool_standings')
        .select(`
          *,
          teams!inner(id, team_number, name)
        `)
        .eq('teams.tournament_id', tournamentId)
        .order('pool', { ascending: true })
        .order('rank', { ascending: true })

      if (error) throw error

      if (!standings) {
        setPool1Rankings([])
        setPool2Rankings([])
        return
      }

      // Transform data and group by pool
      const transformedStandings = standings.map((standing: {
        rank: number
        pool: number
        teams: { team_number: number; name: string }
        matches_played: number
        wins: number
        losses: number
        total_points_for: number
        total_points_against: number
      }) => ({
        rank: standing.rank,
        pool: standing.pool,
        team_number: standing.teams.team_number,
        team_name: standing.teams.name,
        matches_played: standing.matches_played,
        wins: standing.wins,
        losses: standing.losses,
        total_points_for: standing.total_points_for,
        total_points_against: standing.total_points_against,
        point_differential: standing.total_points_for - standing.total_points_against,
      }))

      const pool1 = transformedStandings.filter((s: { rank: number; pool: number }) => s.pool === 1) || []
      const pool2 = transformedStandings.filter((s: { rank: number; pool: number }) => s.pool === 2) || []

      setPool1Rankings(pool1)
      setPool2Rankings(pool2)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load standings'
      console.error('Error fetching standings:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [tournamentId, supabase])

  useEffect(() => {
    fetchStandings()

    // Subscribe to standings changes
    const subscription = supabase
      .channel(`standings:tournament_${tournamentId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pool_standings',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchStandings()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [tournamentId, supabase, fetchStandings])

  const StandingsTable = ({ rankings, pool }: { rankings: Ranking[]; pool: number }) => {
    if (rankings.length === 0) {
      return (
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
          <AlertCircle className="h-4 w-4" />
          <span>No matches played yet</span>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Matches</TableHead>
            <TableHead className="text-center">Wins</TableHead>
            <TableHead className="text-center">Losses</TableHead>
            <TableHead className="text-right">Points For</TableHead>
            <TableHead className="text-right">Points Against</TableHead>
            <TableHead className="text-right">Differential</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((team, index) => (
            <TableRow key={`${pool}-${team.team_number}`} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                    {team.rank}
                  </Badge>
                  {index === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                </div>
              </TableCell>
              <TableCell className="font-medium">{team.team_name}</TableCell>
              <TableCell className="text-center">{team.matches_played}</TableCell>
              <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">
                {team.wins}
              </TableCell>
              <TableCell className="text-center text-red-600 dark:text-red-400">
                {team.losses}
              </TableCell>
              <TableCell className="text-right">{team.total_points_for}</TableCell>
              <TableCell className="text-right">{team.total_points_against}</TableCell>
              <TableCell className="text-right font-medium">
                <span className={team.point_differential > 0 ? 'text-green-600 dark:text-green-400' : team.point_differential < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                  {team.point_differential > 0 ? '+' : ''}{team.point_differential}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pool 1 Standings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>Pool 1</Badge>
            Pool Standings
          </CardTitle>
          <CardDescription>Teams 1, 2, 3</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
              <span>Loading standings...</span>
            </div>
          ) : (
            <StandingsTable rankings={pool1Rankings} pool={1} />
          )}
        </CardContent>
      </Card>

      {/* Pool 2 Standings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">Pool 2</Badge>
            Pool Standings
          </CardTitle>
          <CardDescription>Teams 4, 5, 6</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
              <span>Loading standings...</span>
            </div>
          ) : (
            <StandingsTable rankings={pool2Rankings} pool={2} />
          )}
        </CardContent>
      </Card>

      {/* Tie-Breaking Rules */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ranking Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>1. <strong>Wins</strong> (most wins = higher rank)</p>
          <p>2. <strong>Point Differential</strong> (points for - points against)</p>
          <p>3. <strong>Points For</strong> (total points scored in all matches)</p>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="default">1st</Badge>
          <span className="text-muted-foreground">Advances to Semifinal</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">2nd</Badge>
          <span className="text-muted-foreground">Advances to Semifinal</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">3rd</Badge>
          <span className="text-muted-foreground">Eliminated</span>
        </div>
      </div>
    </div>
  )
}
