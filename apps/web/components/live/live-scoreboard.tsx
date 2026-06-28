interface Props { tournamentId: string }

export function LiveScoreboard({ tournamentId }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Live Scoreboard</h1>
      <p className="text-muted-foreground mt-1">Real-time scores for tournament {tournamentId}</p>
    </div>
  )
}
