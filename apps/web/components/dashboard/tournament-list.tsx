import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const mockTournaments = [
  { id: '1', name: 'Mumbai Pickleball Open', date: 'Jun 28, 2026', status: 'upcoming', players: 32 },
  { id: '2', name: 'Bangalore Summer Circuit', date: 'Jul 5, 2026', status: 'live', players: 48 },
  { id: '3', name: 'Delhi Masters', date: 'Jun 20, 2026', status: 'completed', players: 24 },
]

export function TournamentList() {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tournaments</CardTitle>
        <Button size="sm" className="bg-brand-green text-brand-slate hover:bg-brand-green-light">
          + New Tournament
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTournaments.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-border/50 p-4 hover:border-brand-green/30 transition-colors"
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.date} · {t.players} players</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={t.status === 'live' ? 'default' : 'secondary'}
                className={
                  t.status === 'live'
                    ? 'bg-brand-green/20 text-brand-green animate-pulse'
                    : t.status === 'upcoming'
                    ? 'bg-blue-500/20 text-blue-400'
                    : ''
                }
              >
                {t.status === 'live' ? '● Live' : t.status}
              </Badge>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/tournament/${t.id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
