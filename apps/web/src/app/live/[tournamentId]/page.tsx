import { LiveScoreboard } from '@/components/live/live-scoreboard'

export const metadata = { title: 'Live Scores' }

export default function LivePage({ params }: { params: { tournamentId: string } }) {
  return (
    <div className="min-h-screen bg-background court-pattern">
      <LiveScoreboard tournamentId={params.tournamentId} />
    </div>
  )
}
