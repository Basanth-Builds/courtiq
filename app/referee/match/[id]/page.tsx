'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Minus, Play, Square, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Match {
  id: string
  tournament_id: string
  team1_players: string[]
  team2_players: string[]
  referee: string | null
  scheduled_at: string
  status: 'scheduled' | 'live' | 'completed'
  score_team1: number
  score_team2: number
  current_game: number
  tournaments?: {
    name: string
    location: string
  }
}

interface Player {
  id: string
  name: string
}

interface LiveScoringPageProps {
  params: Promise<{ id: string }>
}

export default function LiveScoringPage({ params }: LiveScoringPageProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const [matchId, setMatchId] = useState<string>('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setMatchId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (matchId) {
      fetchMatch()
      fetchPlayers()
      
      // Set up real-time subscription
      const channel = supabase
        .channel('match-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'matches',
            filter: `id=eq.${matchId}`
          }, 
          (payload) => {
            if (payload.new) {
              setMatch(payload.new as Match)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [matchId])

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          tournaments(name, location)
        `)
        .eq('id', matchId)
        .single()

      if (error) throw error
      setMatch(data)
    } catch (error: any) {
      toast.error(error.message)
      router.push('/referee/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async () => {
    if (!match) return
    
    try {
      const allPlayerIds = [...match.team1_players, ...match.team2_players]
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', allPlayerIds)

      if (error) throw error
      setPlayers(data || [])
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (match) {
      fetchPlayers()
    }
  }, [match])

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown Player'
  }

  const startMatch = async () => {
    if (!match) return

    setScoring(true)
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'live' })
        .eq('id', matchId)

      if (error) throw error
      toast.success('Match started!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setScoring(false)
    }
  }

  const endMatch = async () => {
    if (!match) return

    setScoring(true)
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'completed' })
        .eq('id', matchId)

      if (error) throw error
      toast.success('Match completed!')
      router.push('/referee/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setScoring(false)
    }
  }

  const addPoint = async (team: 1 | 2) => {
    if (!match || match.status !== 'live') return

    setScoring(true)
    try {
      // Add point to points table
      const { error: pointError } = await supabase
        .from('points')
        .insert({
          match_id: matchId,
          scoring_team: team
        })

      if (pointError) throw pointError

      // Update match score
      const newScore = team === 1 ? match.score_team1 + 1 : match.score_team2 + 1
      const updateData = team === 1 
        ? { score_team1: newScore }
        : { score_team2: newScore }

      const { error: matchError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

      if (matchError) throw matchError

      toast.success(`Point added to Team ${team}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setScoring(false)
    }
  }

  const undoLastPoint = async () => {
    if (!match || match.status !== 'live') return

    setScoring(true)
    try {
      // Get the last point
      const { data: lastPoint, error: fetchError } = await supabase
        .from('points')
        .select('*')
        .eq('match_id', matchId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !lastPoint) {
        toast.error('No points to undo')
        return
      }

      // Remove the last point
      const { error: deleteError } = await supabase
        .from('points')
        .delete()
        .eq('id', lastPoint.id)

      if (deleteError) throw deleteError

      // Update match score
      const newScore = lastPoint.scoring_team === 1 
        ? Math.max(0, match.score_team1 - 1)
        : Math.max(0, match.score_team2 - 1)
      
      const updateData = lastPoint.scoring_team === 1
        ? { score_team1: newScore }
        : { score_team2: newScore }

      const { error: matchError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

      if (matchError) throw matchError

      toast.success('Last point undone')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setScoring(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="referee">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon mx-auto mb-4"></div>
            <p>Loading match...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!match) {
    return (
      <DashboardLayout role="referee">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Match not found</h2>
          <Link href="/referee/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="referee">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/referee/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{match.tournaments?.name}</h1>
              <p className="text-muted-foreground">
                {match.tournaments?.location} • {new Date(match.scheduled_at).toLocaleString()}
              </p>
            </div>
          </div>
          <Badge 
            className={
              match.status === 'live' 
                ? 'bg-neon/20 text-neon' 
                : match.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-100 text-slate-800'
            }
          >
            {match.status.toUpperCase()}
          </Badge>
        </div>

        {/* Live Scoring Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Team 1 */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Team 1</CardTitle>
              <CardDescription>
                {match.team1_players.map(playerId => getPlayerName(playerId)).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-4 sm:p-6">
              <div className="score-display">{match.score_team1}</div>
              {match.status === 'live' && (
                <Button 
                  onClick={() => addPoint(1)}
                  disabled={scoring}
                  className="w-full athletic-button touch-button"
                  size="lg"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Add Point
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Match Controls</CardTitle>
              <CardDescription>Game {match.current_game}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {match.status === 'scheduled' && (
                <Button 
                  onClick={startMatch}
                  disabled={scoring}
                  className="w-full athletic-button"
                  size="lg"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Start Match
                </Button>
              )}

              {match.status === 'live' && (
                <>
                  <Button 
                    onClick={undoLastPoint}
                    disabled={scoring}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Undo Last Point
                  </Button>
                  
                  <Button 
                    onClick={endMatch}
                    disabled={scoring}
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Match
                  </Button>
                </>
              )}

              {match.status === 'completed' && (
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">Match Completed</p>
                  <p className="text-muted-foreground">
                    Final Score: {match.score_team1} - {match.score_team2}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team 2 */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Team 2</CardTitle>
              <CardDescription>
                {match.team2_players.map(playerId => getPlayerName(playerId)).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-4 sm:p-6">
              <div className="score-display">{match.score_team2}</div>
              {match.status === 'live' && (
                <Button 
                  onClick={() => addPoint(2)}
                  disabled={scoring}
                  className="w-full athletic-button touch-button"
                  size="lg"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Add Point
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}