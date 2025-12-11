import { requireRole } from '@/lib/auth'
import { createServerComponentClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TournamentMatches from '@/components/tournament-matches'
import AddPlayersDialog from '@/components/add-players-dialog'
import ManualPlayerDialog from '@/components/manual-player-dialog'
import TournamentParticipants from '@/components/tournament-participants'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params
  const profile = await requireRole(['organizer'])
  const supabase = await createServerComponentClient()

  // Get tournament details
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .eq('organizer', profile.id)
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

  return (
    <DashboardLayout role="organizer" userName={profile.name}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/organizer/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{tournament.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-1">
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
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Completed'}
            </Badge>
            <AddPlayersDialog tournamentId={id} />
            <ManualPlayerDialog tournamentId={id} />
          </div>
        </div>

        {/* Stats */}
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
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMatches}</div>
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
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMatches}</div>
            </CardContent>
          </Card>
        </div>

        {/* Players List */}
        {players && players.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Players</CardTitle>
              <CardDescription>Players participating in this tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Participants */}
        <TournamentParticipants tournamentId={id} />

        {/* Matches */}
        <TournamentMatches 
          matches={matches || []} 
          players={players || []}
          tournamentId={id}
          isOrganizer={true}
        />
      </div>
    </DashboardLayout>
  )
}