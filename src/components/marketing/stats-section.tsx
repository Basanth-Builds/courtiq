const stats = [
  { value: '< 30s', label: 'Score entry time' },
  { value: '2-step', label: 'DUPR confirmation' },
  { value: '100%', label: 'Automated seeding' },
  { value: 'Live', label: 'Spectator updates' },
]

export function StatsSection() {
  return (
    <section className="border-y border-surface-border bg-background-secondary py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-4xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-foreground-muted text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
