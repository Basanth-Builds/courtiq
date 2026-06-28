import { Trophy, Gavel, CheckCircle, Clock } from 'lucide-react'

const stats = [
  { label: 'Active Tournaments', value: '3', icon: Trophy, change: '+1 this week' },
  { label: 'Matches Today', value: '24', icon: Gavel, change: '6 in progress' },
  { label: 'Confirmed Results', value: '18', icon: CheckCircle, change: '2 pending' },
  { label: 'DUPR Pending', value: '2', icon: Clock, change: 'Ready to export' },
]

export function QuickStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, change }) => (
        <div key={label} className="glass rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-brand-green/10 rounded-xl flex items-center justify-center">
              <Icon size={18} className="text-brand-green" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-foreground mb-1">{value}</div>
          <div className="text-foreground-muted text-xs">{label}</div>
          <div className="text-brand-green text-xs mt-1">{change}</div>
        </div>
      ))}
    </div>
  )
}
