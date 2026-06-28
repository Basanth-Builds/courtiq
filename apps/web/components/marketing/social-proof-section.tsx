export function SocialProofSection() {
  const quotes = [
    {
      quote: 'Court IQ cut our post-tournament DUPR upload time from 3 hours to 10 minutes.',
      author: 'Priya S.',
      role: 'Tournament Director, Mumbai Pickleball Open',
    },
    {
      quote: 'Our umpires love the court desk. Simple, fast, and works on any phone.',
      author: 'Rahul K.',
      role: 'Head Referee, National Pickleball Circuit',
    },
    {
      quote: 'Spectators can follow the score live. Game changer for crowd engagement.',
      author: 'Anita M.',
      role: 'Event Organizer, Bangalore Open',
    },
  ]

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight mb-12">
          Trusted by tournament directors
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {quotes.map((q) => (
            <div
              key={q.author}
              className="rounded-2xl border border-border/60 bg-card p-6 space-y-4"
            >
              <p className="text-muted-foreground text-sm leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-sm">{q.author}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
