import { Zap, Users, Trophy, BarChart3, Shield, Download } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Live Court Scoring',
    description:
      'Umpires enter scores directly from the court on any device. Results broadcast instantly to every screen.',
  },
  {
    icon: Users,
    title: 'Smart Pool Seeding',
    description:
      'DUPR ratings drive automatic pool seeding. Tie-breakers handled by head-to-head, game diff, and points.',
  },
  {
    icon: Trophy,
    title: 'Auto Playoff Draws',
    description:
      'Top teams advance automatically. Quarter-finals, semis, finals, and third-place match generated instantly.',
  },
  {
    icon: Shield,
    title: 'Two-Step Confirmation',
    description:
      'Every result requires umpire entry and referee confirmation before it\'s locked in or sent to DUPR.',
  },
  {
    icon: BarChart3,
    title: 'Spectator Live View',
    description:
      'A public live scoreboard anyone can open. No account needed. Scores update the moment they happen.',
  },
  {
    icon: Download,
    title: 'DUPR CSV Export',
    description:
      'Export tournament results in DUPR-ready format with one click. Fully formatted and validated.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Everything the court needs
          </h2>
          <p className="text-foreground-muted text-lg max-w-xl mx-auto">
            Built ground-up for tournament directors, umpires, referees, and players.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 hover:border-brand-green/30 transition-colors group"
            >
              <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-green/20 transition-colors">
                <Icon size={20} className="text-brand-green" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-foreground-muted text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
