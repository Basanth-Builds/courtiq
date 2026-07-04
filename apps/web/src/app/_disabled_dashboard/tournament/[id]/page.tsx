import { TournamentHeader } from '@/components/tournament/tournament-header'
import { PoolsView } from '@/components/tournament/pools-view'
import { PlayoffBracket } from '@/components/tournament/playoff-bracket'
import { CourtList } from '@/components/tournament/court-list'

export const metadata = { title: 'Tournament' }

export default function TournamentPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 animate-slide-up">
      <TournamentHeader tournamentId={params.id} />
      <CourtList tournamentId={params.id} />
      <PoolsView tournamentId={params.id} />
      <PlayoffBracket tournamentId={params.id} />
    </div>
  )
}
