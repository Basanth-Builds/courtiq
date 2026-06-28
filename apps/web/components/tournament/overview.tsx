interface Props { tournamentId: string }

export function TournamentOverview({ tournamentId }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Tournament {tournamentId}</h1>
      <p className="text-muted-foreground mt-1">Live tournament management</p>
    </div>
  )
}
