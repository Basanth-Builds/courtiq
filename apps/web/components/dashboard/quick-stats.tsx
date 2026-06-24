import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Users, Zap, FileCheck } from 'lucide-react'

const stats = [
  { label: 'Active Tournaments', value: '3', icon: Trophy, color: 'text-brand-green' },
  { label: 'Players This Week', value: '148', icon: Users, color: 'text-blue-400' },
  { label: 'Matches Today', value: '24', icon: Zap, color: 'text-yellow-400' },
  { label: 'DUPR Synced', value: '19', icon: FileCheck, color: 'text-green-400' },
]

export function QuickStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
