import { requireRole } from '@/lib/auth'
import { createServerComponentClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

export default async function OrganizerDashboard() {
  const profile = await requireRole(['organizer'])
  const supabase = await createServerComponentClient()

  // Get organizer's tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      matches(count)
    `)
    .eq('organizer', profile.id)
    .order('created_at', { ascending: false })

  // Get recent matches
  const { data: recentMatches } = await supabase
    .from('matches')
    .select(`
      *,
      tournaments(name)
    `)
    .in('tournament_id', tournaments?.map(t => t.id) || [])
    .order('scheduled_at', { ascending: false })
    .limit(5)

  const stats = {
    totalTournaments: tournaments?.length || 0,
    activeTournaments: tournaments?.filter(t => new Date(t.date_end) >= new Date()).length || 0,
    totalMatches: tournaments?.reduce((acc, t) => acc + (t.matches?.[0]?.count || 0), 0) || 0,
    liveMatches: recentMatches?.filter(m => m.status === 'live').length || 0
  }

  return (
    <DashboardLayout role="organizer" userName={profile.name}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Organizer Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your tournaments and events</p>
          </div>
          <Link href="/organizer/tournaments/create">
            <Button className="athletic-button w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold neon-glow">{stats.activeTournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
        </div>

        {/* Recent Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tournaments</CardTitle>
            <CardDescription>Your latest tournament events</CardDescription>
          </CardHeader>
          <CardContent>
            {tournaments && tournaments.length > 0 ? (
              <div className="space-y-4">
                {tournaments.slice(0, 5).map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tournament.location} • {new Date(tournament.date_start).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        new Date(tournament.date_end) >= new Date() 
                          ? 'bg-neon/20 text-neon' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {new Date(tournament.date_end) >= new Date() ? 'Active' : 'Completed'}
                      </span>
                      <Link href={`/organizer/tournaments/${tournament.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
                <p className="text-muted-foreground mb-4">Create your first tournament to get started</p>
                <Link href="/organizer/tournaments/create">
                  <Button className="athletic-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tournament
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}