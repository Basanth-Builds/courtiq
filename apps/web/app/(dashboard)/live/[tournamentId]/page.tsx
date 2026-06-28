import { LiveScoreboard } from '@/components/live/live-scoreboard'

interface Props {
  params: { tournamentId: string }
}

export default function LivePage({ params }: Props) {
  return <LiveScoreboard tournamentId={params.tournamentId} />
}
