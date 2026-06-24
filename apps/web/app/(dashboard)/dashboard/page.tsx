'use client'

import { TournamentList } from '@/components/dashboard/tournament-list'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { DashboardHeader } from '@/components/dashboard/header'

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      <DashboardHeader />
      <QuickStats />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
