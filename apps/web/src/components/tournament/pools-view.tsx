export function PoolsView({ tournamentId }: { tournamentId: string }) {
  const pools = [
    {
      name: 'Pool A',
      teams: [
        { rank: 1, name: 'Sharma / Patel', w: 3, l: 0, pts: 33 },
        { rank: 2, name: 'Gupta / Singh', w: 2, l: 1, pts: 28 },
        { rank: 3, name: 'Khan / Mehta', w: 1, l: 2, pts: 22 },
        { rank: 4, name: 'Nair / Rao', w: 0, l: 3, pts: 15 },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground">Pools</h2>
      {pools.map((pool) => (
        <div key={pool.name} className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="font-display font-semibold text-foreground">{pool.name}</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-foreground-muted text-xs border-b border-surface-border">
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Team</th>
                <th className="text-center p-4">W</th>
                <th className="text-center p-4">L</th>
                <th className="text-center p-4">Pts</th>
              </tr>
            </thead>
            <tbody>
              {pool.teams.map((team) => (
                <tr key={team.name} className={`border-b border-surface-border last:border-0 ${
                  team.rank <= 2 ? 'bg-brand-green/5' : ''
                }`}>
                  <td className="p-4">
                    <span className={`font-display font-bold text-sm ${
                      team.rank <= 2 ? 'text-brand-green' : 'text-foreground-muted'
                    }`}>{team.rank}</span>
                  </td>
                  <td className="p-4 font-medium text-foreground text-sm">
                    {team.name}
                    {team.rank <= 2 && <span className="ml-2 text-brand-green text-xs">→ Playoffs</span>}
                  </td>
                  <td className="p-4 text-center text-success text-sm font-semibold">{team.w}</td>
                  <td className="p-4 text-center text-destructive text-sm font-semibold">{team.l}</td>
                  <td className="p-4 text-center font-display font-bold text-foreground">{team.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
