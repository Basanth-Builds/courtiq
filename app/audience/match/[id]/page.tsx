'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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
  profiles?: {
    name: string
  }
}

interface Player {
  id: string
  name: string
}

interface Point {
  id: string
  scoring_team: number
  timestamp: string
}

interface LiveMatchPageProps {
  params: Promise<{ id: string }>
}

export default function LiveMatchPage({ params }: LiveMatchPageProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [matchId, setMatchId] = useState<string>('')
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
      fetchPoints()
      
      // Set up real-time subscriptions
      const matchChannel = supabase
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

      const pointsChannel = supabase
        .channel('points-updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'points',
            filter: `match_id=eq.${matchId}`
          }, 
          () => {
            fetchPoints()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(matchChannel)
        supabase.removeChannel(pointsChannel)
      }
    }
  }, [matchId])

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          tournaments(name, location),
          profiles!matches_referee_fkey(name)
        `)
        .eq('id', matchId)
        .single()

      if (error) throw error
      setMatch(data)
      
      // Fetch players
      if (data) {
        const allPlayerIds = [...data.team1_players, ...data.team2_players]
        const { data: playersData, error: playersError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', allPlayerIds)

        if (playersError) throw playersError
        setPlayers(playersData || [])
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('match_id', matchId)
        .order('timestamp', { ascending: false })
        .limit(10)

      if (error) throw error
      setPoints(data || [])
    } catch (error: any) {
      console.error('Error fetching points:', error.message)
    }
  }

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown Player'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-neon/20 text-neon'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="audience">
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
      <DashboardLayout role="audience">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Match not found</h2>
          <Link href="/audience/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="audience">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/audience/explore">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explore
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{match.tournaments?.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-1">
                {match.tournaments?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{match.tournaments.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(match.scheduled_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(match.status)}>
            {match.status.toUpperCase()}
          </Badge>
        </div>

        {/* Live Score Display */}
        <Card className={match.status === 'live' ? 'border-neon/20 bg-neon/5' : ''}>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Team 1 */}
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Team 1</h2>
                <div className="space-y-1 mb-4">
                  {match.team1_players.map((playerId) => (
                    <div key={playerId} className="text-lg">
                      {getPlayerName(playerId)}
                    </div>
                  ))}
                </div>
                <div className={`text-6xl font-black ${
                  match.score_team1 > match.score_team2 ? 'neon-glow' : ''
                }`}>
                  {match.score_team1}
                </div>
              </div>

              {/* Match Info */}
              <div className="text-center space-y-4">
                {match.status === 'live' && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-3 w-3 bg-neon rounded-full animate-pulse" />
                    <span className="text-lg font-semibold neon-glow">LIVE</span>
                  </div>
                )}
                
                <div className="text-4xl font-bold text-muted-foreground">VS</div>
                
                <div className="text-sm text-muted-foreground">
                  Game {match.current_game}
                </div>

                {match.profiles?.name && (
                  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Referee: {match.profiles.name}</span>
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Team 2</h2>
                <div className="space-y-1 mb-4">
                  {match.team2_players.map((playerId) => (
                    <div key={playerId} className="text-lg">
                      {getPlayerName(playerId)}
                    </div>
                  ))}
                </div>
                <div className={`text-6xl font-black ${
                  match.score_team2 > match.score_team1 ? 'neon-glow' : ''
                }`}>
                  {match.score_team2}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Points */}
        {points.length > 0 && match.status === 'live' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Points</CardTitle>
              <CardDescription>Latest scoring activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {points.map((point, index) => (
                  <div key={point.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant={point.scoring_team === 1 ? "default" : "secondary"}>
                        Team {point.scoring_team}
                      </Badge>
                      <span className="text-sm">scored a point</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(point.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Status Messages */}
        {match.status === 'scheduled' && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Match Not Started</h3>
              <p className="text-muted-foreground">
                This match is scheduled for {new Date(match.scheduled_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}

        {match.status === 'completed' && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Match Completed</h3>
              <p className="text-muted-foreground">
                Final Score: {match.score_team1} - {match.score_team2}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {match.score_team1 > match.score_team2 ? 'Team 1' : 'Team 2'} wins!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}