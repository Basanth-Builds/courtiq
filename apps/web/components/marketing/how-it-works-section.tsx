import { Badge } from '@/components/ui/badge'

const steps = [
  {
    step: '01',
    title: 'Set up your tournament',
    description:
      'Import players, assign DUPR IDs, configure pools and draw sizes. Done in minutes.',
  },
  {
    step: '02',
    title: 'Umpires score live',
    description:
      'Court umpires enter scores from their phone as the match happens. Live for everyone.',
  },
  {
    step: '03',
    title: 'Referee confirms',
    description:
      'The tournament referee reviews and confirms results. A second approval creates an audit trail.',
  },
  {
    step: '04',
    title: 'Seedings & draws auto-generate',
    description:
      'Pool standings are calculated instantly. Top players advance. Playoff brackets are drawn automatically.',
  },
  {
    step: '05',
    title: 'DUPR CSV exported',
    description:
      'Once a match is confirmed, the DUPR submission is queued and the CSV is ready to upload. No extra steps.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-brand-slate py-24" id="how-it-works">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How Court IQ works
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            A workflow that runs itself.
          </p>
        </div>

        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-brand-green/20 hidden sm:block" />

          {steps.map((step, i) => (
            <div key={step.step} className="flex gap-6 pb-10 last:pb-0 relative">
              <div className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 border border-brand-green/30 z-10">
                <span className="text-sm font-bold text-brand-green">{step.step}</span>
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
