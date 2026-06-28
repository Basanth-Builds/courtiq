interface Props { tournamentId: string }

export function PoolsGrid({ tournamentId }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pools</h2>
      <p className="text-muted-foreground text-sm">Pool standings will appear here once matches begin.</p>
    </div>
  )
}
