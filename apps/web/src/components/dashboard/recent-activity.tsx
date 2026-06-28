import { Clock } from 'lucide-react'

const activities = [
  { text: 'Match #12 confirmed by referee', time: '2m ago', type: 'confirm' },
  { text: 'DUPR CSV exported for Summer Open', time: '8m ago', type: 'dupr' },
  { text: 'Pool A standings updated', time: '15m ago', type: 'pool' },
  { text: 'Court 3 score updated: 11-7', time: '18m ago', type: 'score' },
  { text: 'Playoff bracket generated', time: '1h ago', type: 'bracket' },
]

export function RecentActivity() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-surface-border">
        <h2 className="font-display font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="p-5 space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-3">
            <Clock size={14} className="text-foreground-subtle mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-foreground text-xs">{a.text}</p>
              <p className="text-foreground-subtle text-xs mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
