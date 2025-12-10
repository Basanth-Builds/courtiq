import { requireRole } from '@/lib/auth'
import { createServerComponentClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, CheckCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function RefereeDashboard() {
  const profile = await requireRole(['referee'])
  const supabase = await createServerComponentClient()

  // Get referee's assigned matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      tournaments(name, location)
    `)
    .eq('referee', profile.id)
    .order('scheduled_at', { ascending: true })

  const upcomingMatches = matches?.filter(m => 
    m.status === 'scheduled' && new Date(m.scheduled_at) > new Date()
  ) || []
  
  const liveMatches = matches?.filter(m => m.status === 'live') || []
  const completedMatches = matches?.filter(m => m.status === 'completed') || []
  const todayMatches = matches?.filter(m => {
    const matchDate = new Date(m.scheduled_at).toDateString()
    const today = new Date().toDateString()
    return matchDate === today
  }) || []

  const stats = {
    totalMatches: matches?.length || 0,
    liveMatches: liveMatches.length,
    completedMatches: completedMatches.length,
    todayMatches: todayMatches.length
  }

  return (
    <DashboardLayout role="referee" userName={profile.name}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Referee Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned matches and live scoring</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
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
              <CardTitle className="text-sm font-medium">Today's Matches</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedMatches}</div>
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
              <CardDescription>Matches currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg bg-neon/5">
                    <div>
                      <h3 className="font-semibold">{match.tournaments?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {match.tournaments?.location} • Started: {new Date(match.scheduled_at).toLocaleTimeString()}
                      </p>
                      <div className="mt-2">
                        <span className="text-lg font-bold neon-glow">
                          {match.score_team1} - {match.score_team2}
                        </span>
                      </div>
                    </div>
                    <Link href={`/referee/match/${match.id}`}>
                      <Button className="athletic-button">
                        <Play className="h-4 w-4 mr-2" />
                        Continue Scoring
                      </Button>
                    </Link>
                  </div>
                ))}
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
                {upcomingMatches.slice(0, 5).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{match.tournaments?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {match.tournaments?.location} • {new Date(match.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {match.status.toUpperCase()}
                      </Badge>
                      <Link href={`/referee/match/${match.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming matches</h3>
                <p className="text-muted-foreground">You don't have any matches scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed Matches */}
        {completedMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Completed Matches</CardTitle>
              <CardDescription>Your recently finished matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedMatches.slice(0, 3).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{match.tournaments?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {match.tournaments?.location} • {new Date(match.scheduled_at).toLocaleDateString()}
                      </p>
                      <div className="mt-1">
                        <span className="font-medium">Final Score: {match.score_team1} - {match.score_team2}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      COMPLETED
                    </Badge>
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