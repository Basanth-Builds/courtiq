export function PlayoffBracket({ tournamentId }: { tournamentId: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold text-foreground mb-6">Playoff Bracket</h2>
      <div className="flex gap-8 overflow-x-auto pb-4">
        {['Quarterfinals', 'Semifinals', 'Final'].map((round, roundIdx) => (
          <div key={round} className="flex-shrink-0">
            <div className="text-foreground-muted text-xs font-semibold mb-4 text-center">{round}</div>
            <div className="space-y-4">
              {Array.from({ length: Math.pow(2, 2 - roundIdx) }).map((_, i) => (
                <div key={i} className="w-48 bg-surface border border-surface-border rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-surface-border">
                    <div className="text-foreground text-xs font-medium">TBD</div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-foreground text-xs font-medium">TBD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
