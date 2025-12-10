import { createServerComponentClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Eye, Trophy } from 'lucide-react'
import Link from 'next/link'

export default async function AudienceExplore() {
  const supabase = await createServerComponentClient()

  // Get all tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      profiles!tournaments_organizer_fkey(name),
      matches(
        id,
        status,
        score_team1,
        score_team2,
        team1_players,
        team2_players
      )
    `)
    .order('date_start', { ascending: false })

  // Get live matches across all tournaments
  const { data: liveMatches } = await supabase
    .from('matches')
    .select(`
      *,
      tournaments(name, location)
    `)
    .eq('status', 'live')
    .order('scheduled_at', { ascending: true })

  const activeTournaments = tournaments?.filter(t => 
    new Date(t.date_end) >= new Date()
  ) || []

  const upcomingTournaments = tournaments?.filter(t => 
    new Date(t.date_start) > new Date()
  ) || []

  return (
    <DashboardLayout role="audience">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Explore Tournaments</h1>
          <p className="text-muted-foreground">Discover and follow live tournaments and matches</p>
        </div>

        {/* Live Matches */}
        {liveMatches && liveMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-neon rounded-full animate-pulse" />
                <span>Live Matches</span>
              </CardTitle>
              <CardDescription>Matches happening right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.map((match) => (
                  <Card key={match.id} className="border-neon/20 bg-neon/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{match.tournaments?.name}</h3>
                        <Badge className="bg-neon/20 text-neon">LIVE</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {match.tournaments?.location}
                      </p>
                      <div className="text-center mb-3">
                        <span className="text-2xl font-bold neon-glow">
                          {match.score_team1} - {match.score_team2}
                        </span>
                      </div>
                      <Link href={`/audience/match/${match.id}`}>
                        <Button className="w-full athletic-button" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Watch Live
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tournaments</CardTitle>
            <CardDescription>Tournaments currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            {activeTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTournaments.map((tournament) => {
                  const totalMatches = tournament.matches?.length || 0
                  const liveMatchesCount = tournament.matches?.filter((m: any) => m.status === 'live').length || 0
                  const completedMatches = tournament.matches?.filter((m: any) => m.status === 'completed').length || 0
                  
                  return (
                    <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{tournament.name}</CardTitle>
                            <CardDescription>
                              by {tournament.profiles?.name}
                            </CardDescription>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tournament.location && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{tournament.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(tournament.date_start).toLocaleDateString()} - {new Date(tournament.date_end).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Matches: {completedMatches}/{totalMatches}</span>
                          {liveMatchesCount > 0 && (
                            <span className="neon-glow font-semibold">
                              {liveMatchesCount} Live
                            </span>
                          )}
                        </div>

                        <Link href={`/audience/tournament/${tournament.id}`}>
                          <Button className="w-full" variant="outline">
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
                <h3 className="text-lg font-semibold mb-2">No active tournaments</h3>
                <p className="text-muted-foreground">Check back later for new tournaments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tournaments */}
        {upcomingTournaments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tournaments</CardTitle>
              <CardDescription>Tournaments starting soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTournaments.slice(0, 5).map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {tournament.profiles?.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        {tournament.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{tournament.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Starts {new Date(tournament.date_start).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Upcoming</Badge>
                      <Link href={`/audience/tournament/${tournament.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}