import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Zap,
  Trophy,
  Users,
  ClipboardCheck,
  BarChart3,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Live Score Entry',
    description:
      'Umpires enter scores from courtside in seconds. Spectators see updates instantly — no more asking what the score is.',
  },
  {
    icon: Trophy,
    title: 'Auto Seeding & Draws',
    description:
      'Pool assignments and playoff brackets are generated automatically using DUPR ratings and results. Zero manual calculation.',
  },
  {
    icon: ClipboardCheck,
    title: 'Dual Confirmation',
    description:
      'Every result is confirmed by the umpire then approved by the referee. Only then does it become final and eligible for DUPR.',
  },
  {
    icon: BarChart3,
    title: 'DUPR Auto-Submit',
    description:
      'Once confirmed, match results are packaged into DUPR-compatible CSV files instantly. No manual uploads, no missed matches.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description:
      'Umpires, referees, tournament directors, and spectators each get a tailored view. Right access for the right person.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description:
      'Court IQ works flawlessly on phones and tablets. Umpires score from their phones, referees approve from anywhere.',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background py-24" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything a tournament needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by people who’ve run real pickleball tournaments. Every feature solves a real
            problem.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/50 hover:border-brand-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-green/10"
            >
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 group-hover:bg-brand-green/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-brand-green" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
