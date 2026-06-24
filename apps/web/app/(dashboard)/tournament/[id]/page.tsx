import { TournamentOverview } from '@/components/tournament/overview'
import { PoolsGrid } from '@/components/tournament/pools-grid'
import { PlayoffBracket } from '@/components/tournament/playoff-bracket'
import { CourtAssignments } from '@/components/tournament/court-assignments'

interface Props {
  params: { id: string }
}

export default function TournamentPage({ params }: Props) {
  return (
    <div className="space-y-8 p-6">
      <TournamentOverview tournamentId={params.id} />
      <CourtAssignments tournamentId={params.id} />
      <PoolsGrid tournamentId={params.id} />
      <PlayoffBracket tournamentId={params.id} />
    </div>
  )
}
