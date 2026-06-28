interface Props { tournamentId: string }

export function PlayoffBracket({ tournamentId }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Playoff Bracket</h2>
      <p className="text-muted-foreground text-sm">Bracket auto-generates when pool stage completes.</p>
    </div>
  )
}
