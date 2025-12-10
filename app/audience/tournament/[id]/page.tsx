import { createServerComponentClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Users, Eye, Trophy } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TournamentMatches from '@/components/tournament-matches'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function AudienceTournamentPage({ params }: TournamentPageProps) {
  const { id } = await params
  const supabase = await createServerComponentClient()

  // Get tournament details
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      profiles!tournaments_organizer_fkey(name)
    `)
    .eq('id', id)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Get matches for this tournament
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      profiles!matches_referee_fkey(name)
    `)
    .eq('tournament_id', id)
    .order('scheduled_at', { ascending: true })

  // Get all players in this tournament
  const allPlayerIds = new Set<string>()
  matches?.forEach(match => {
    match.team1_players.forEach((playerId: string) => allPlayerIds.add(playerId))
    match.team2_players.forEach((playerId: string) => allPlayerIds.add(playerId))
  })

  const { data: players } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', Array.from(allPlayerIds))

  const isActive = new Date(tournament.date_end) >= new Date()
  const totalMatches = matches?.length || 0
  const completedMatches = matches?.filter(m => m.status === 'completed').length || 0
  const liveMatches = matches?.filter(m => m.status === 'live').length || 0
  const upcomingMatches = matches?.filter(m => m.status === 'scheduled').length || 0

  return (
    <DashboardLayout role="audience">
      <div className="space-y-8">
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
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-1">
                <span>Organized by {tournament.profiles?.name}</span>
                {tournament.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{tournament.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(tournament.date_start).toLocaleDateString()} - {new Date(tournament.date_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? 'Active' : 'Completed'}
          </Badge>
        </div>

        {/* Tournament Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
              <div className="h-2 w-2 bg-neon rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-glow">{liveMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMatches}</div>
              <p className="text-xs text-muted-foreground">
                {totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}% complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Matches Highlight */}
        {liveMatches > 0 && (
          <Card className="border-neon/20 bg-neon/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-neon rounded-full animate-pulse" />
                <span>Live Matches</span>
              </CardTitle>
              <CardDescription>Matches happening right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches?.filter(m => m.status === 'live').map((match) => {
                  const getPlayerName = (playerId: string) => {
                    return players?.find(p => p.id === playerId)?.name || 'Unknown Player'
                  }

                  return (
                    <Card key={match.id} className="border-neon/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-neon/20 text-neon">LIVE</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(match.scheduled_at).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 items-center mb-3">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Team 1</div>
                            <div className="text-sm">
                              {match.team1_players.map((id: string) => getPlayerName(id)).join(', ')}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold neon-glow">
                              {match.score_team1} - {match.score_team2}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Team 2</div>
                            <div className="text-sm">
                              {match.team2_players.map((id: string) => getPlayerName(id)).join(', ')}
                            </div>
                          </div>
                        </div>

                        <Link href={`/audience/match/${match.id}`}>
                          <Button className="w-full athletic-button" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Watch Live
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Players List */}
        {players && players.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tournament Players</CardTitle>
              <CardDescription>Players participating in this tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-2 p-3 border rounded">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Matches */}
        <TournamentMatches 
          matches={matches || []} 
          players={players || []}
          tournamentId={id}
          isOrganizer={false}
        />
      </div>
    </DashboardLayout>
  )
}