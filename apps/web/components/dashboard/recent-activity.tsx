import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const activities = [
  { text: 'Score submitted: Court 3', time: '2m ago', type: 'score' },
  { text: 'Result confirmed by Referee', time: '5m ago', type: 'confirm' },
  { text: 'DUPR CSV queued', time: '5m ago', type: 'dupr' },
  { text: 'New player registered', time: '12m ago', type: 'player' },
  { text: 'Pool A standings updated', time: '18m ago', type: 'pool' },
]

export function RecentActivity() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-green" />
            <div>
              <p className="text-sm">{a.text}</p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
