import { requireRole } from '@/lib/auth'
import { createServerComponentClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, Target, TrendingUp, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function PlayerDashboard() {
  const profile = await requireRole(['player'])
  const supabase = await createServerComponentClient()

  // Get player's matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      tournaments(name, location, organizer)
    `)
    .or(`team1_players.cs.{${profile.id}},team2_players.cs.{${profile.id}}`)
    .order('scheduled_at', { ascending: false })

  // Get tournaments the player is participating in
  const tournamentIds = [...new Set(matches?.map(m => m.tournament_id) || [])]
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      profiles!tournaments_organizer_fkey(name)
    `)
    .in('id', tournamentIds)

  const upcomingMatches = matches?.filter(m => 
    m.status === 'scheduled' && new Date(m.scheduled_at) > new Date()
  ) || []
  
  const liveMatches = matches?.filter(m => m.status === 'live') || []
  const completedMatches = matches?.filter(m => m.status === 'completed') || []
  
  // Calculate win/loss record
  const playerWins = completedMatches.filter(match => {
    const isTeam1 = match.team1_players.includes(profile.id)
    return isTeam1 ? match.score_team1 > match.score_team2 : match.score_team2 > match.score_team1
  }).length

  const stats = {
    totalMatches: matches?.length || 0,
    wins: playerWins,
    losses: completedMatches.length - playerWins,
    liveMatches: liveMatches.length,
    upcomingMatches: upcomingMatches.length,
    tournaments: tournaments?.length || 0
  }

  const winRate = stats.totalMatches > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0

  return (
    <DashboardLayout role="player" userName={profile.name}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Player Dashboard</h1>
          <p className="text-muted-foreground">Track your tournament performance and upcoming matches</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-glow">{winRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.wins}W - {stats.losses}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
              <div className="h-2 w-2 bg-neon rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-glow">{stats.liveMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingMatches}</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-neon rounded-full animate-pulse" />
                <span>Live Matches</span>
              </CardTitle>
              <CardDescription>Your matches currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.map((match) => {
                  const isTeam1 = match.team1_players.includes(profile.id)
                  const myScore = isTeam1 ? match.score_team1 : match.score_team2
                  const opponentScore = isTeam1 ? match.score_team2 : match.score_team1
                  
                  return (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg bg-neon/5">
                      <div>
                        <h3 className="font-semibold">{match.tournaments?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {match.tournaments?.location} • Started: {new Date(match.scheduled_at).toLocaleTimeString()}
                        </p>
                        <div className="mt-2">
                          <span className="text-lg font-bold neon-glow">
                            {myScore} - {opponentScore}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            (You are {isTeam1 ? 'Team 1' : 'Team 2'})
                          </span>
                        </div>
                      </div>
                      <Link href={`/audience/match/${match.id}`}>
                        <Button className="athletic-button">
                          <Eye className="h-4 w-4 mr-2" />
                          Watch Live
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Matches</CardTitle>
            <CardDescription>Your scheduled matches</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.slice(0, 5).map((match) => {
                  const isTeam1 = match.team1_players.includes(profile.id)
                  
                  return (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{match.tournaments?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {match.tournaments?.location} • {new Date(match.scheduled_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          You are {isTeam1 ? 'Team 1' : 'Team 2'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {match.status.toUpperCase()}
                        </Badge>
                        <Link href={`/audience/match/${match.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming matches</h3>
                <p className="text-muted-foreground">You don't have any matches scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament Participation */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tournaments</CardTitle>
            <CardDescription>Tournaments you're participating in</CardDescription>
          </CardHeader>
          <CardContent>
            {tournaments && tournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.map((tournament) => {
                  const tournamentMatches = matches?.filter(m => m.tournament_id === tournament.id) || []
                  const tournamentWins = tournamentMatches.filter(match => {
                    if (match.status !== 'completed') return false
                    const isTeam1 = match.team1_players.includes(profile.id)
                    return isTeam1 ? match.score_team1 > match.score_team2 : match.score_team2 > match.score_team1
                  }).length
                  
                  const isActive = new Date(tournament.date_end) >= new Date()
                  
                  return (
                    <Card key={tournament.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{tournament.name}</h3>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? 'Active' : 'Completed'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {tournament.profiles?.name}
                        </p>
                        <div className="text-sm space-y-1">
                          <div>Matches: {tournamentMatches.length}</div>
                          <div>Wins: {tournamentWins}</div>
                        </div>
                        <Link href={`/audience/tournament/${tournament.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-3">
                            <Trophy className="h-4 w-4 mr-2" />
                            View Tournament
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
                <p className="text-muted-foreground">You haven't joined any tournaments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}