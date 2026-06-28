interface Props { tournamentId: string }

export function CourtAssignments({ tournamentId }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Court Assignments</h2>
      <p className="text-muted-foreground text-sm">Active court assignments will appear here.</p>
    </div>
  )
}
