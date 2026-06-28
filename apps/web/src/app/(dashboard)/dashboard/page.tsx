import { TournamentList } from '@/components/dashboard/tournament-list'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-foreground-muted mt-1">Manage your tournaments and track live scores</p>
      </div>
      <QuickStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TournamentList />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
