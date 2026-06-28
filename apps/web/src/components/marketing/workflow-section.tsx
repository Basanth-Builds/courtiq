const steps = [
  { n: '01', title: 'Umpire enters score', desc: 'Live score entry from the court. Any device, any browser.' },
  { n: '02', title: 'Referee confirms', desc: 'One tap in the Referee Console locks the result.' },
  { n: '03', title: 'Standings update', desc: 'Pool standings and seedings recalculate automatically.' },
  { n: '04', title: 'Playoffs draw', desc: 'Top teams advance. Bracket generated with zero manual work.' },
  { n: '05', title: 'DUPR export', desc: 'All match data exported as a DUPR-ready CSV file instantly.' },
]

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-24 bg-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            From first point to DUPR
          </h2>
          <p className="text-foreground-muted text-lg">
            The entire tournament workflow, automated in five steps.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-surface-border hidden md:block" />
          <div className="space-y-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-brand-green/10 border border-brand-green/20 rounded-2xl flex items-center justify-center relative z-10">
                  <span className="font-display font-bold text-brand-green text-sm">{n}</span>
                </div>
                <div className="pt-3">
                  <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-foreground-muted text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
