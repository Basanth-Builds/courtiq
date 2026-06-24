import Link from 'next/link'
import { ArrowRight, Zap, Users, Trophy, BarChart3, Shield, Smartphone } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-court-pattern text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            Court <span className="text-gradient">IQ</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#a8d634]/20 text-[#a8d634] font-medium border border-[#a8d634]/30">BETA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#a8d634] text-[#1a1d2e] hover:bg-[#c4e86a] transition-all glow-green"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a8d634]/10 border border-[#a8d634]/20 text-[#a8d634] text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          Built for Pickleball Tournaments
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.05]">
          Score it live.<br />
          <span className="text-gradient">Run it smart.</span>
        </h1>
        <p className="mt-6 text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Court IQ automates the entire tournament workflow — from court scoring and pool seeding
          to playoff draws and DUPR submissions. No more manual spreadsheets.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#a8d634] text-[#1a1d2e] font-bold text-lg hover:bg-[#c4e86a] transition-all glow-green-intense"
          >
            Start your tournament <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#workflow"
            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white/80 font-semibold text-lg hover:bg-white/5 transition-all"
          >
            See how it works
          </a>
        </div>
        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { label: 'Live courts', value: '∞' },
            { label: 'Auto seeding', value: '< 1s' },
            { label: 'DUPR sync', value: '2-tap' },
            { label: 'Spectator lag', value: 'Real-time' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
              <div className="text-3xl font-black text-[#a8d634]">{stat.value}</div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight">Everything you need to run a flawless tournament</h2>
            <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto">One platform. Every role. Zero chaos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap,       title: 'Live Score Entry',     desc: 'Umpires enter scores from the court on any phone. Real-time sync to all screens instantly.' },
              { icon: Trophy,    title: 'Auto Seeding & Draws', desc: 'Pool standings, tie-breakers, and playoff brackets generated automatically by DUPR rating.' },
              { icon: BarChart3, title: 'DUPR Submission',      desc: 'Two-tap confirmation workflow. Umpire confirms, referee approves, DUPR CSV generated.' },
              { icon: Users,     title: 'Role-based Access',    desc: 'Umpire, Referee, Admin, and Spectator roles. Everyone sees exactly what they need.' },
              { icon: Smartphone,title: 'Mobile-first Design',  desc: 'Court desk UI is built for quick thumb access. Works on any phone, no app install needed.' },
              { icon: Shield,    title: 'Audit Trail',          desc: 'Every score change and confirmation is logged with timestamps and user identity.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl transition-all group"
                style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(168,214,52,0.1)'}}>
                  <feature.icon className="w-6 h-6 text-[#a8d634]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6" style={{background:'rgba(255,255,255,0.02)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight">The whole workflow. Automated.</h2>
            <p className="mt-4 text-white/50 text-lg">From first serve to final DUPR upload — in one platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px" style={{background:'linear-gradient(to bottom, #a8d634, rgba(168,214,52,0.3), transparent)'}} />
            {[
              { step: '01', title: 'Tournament Setup',    desc: 'Admin creates tournament, imports participants via CSV or manual entry, assigns DUPR IDs.' },
              { step: '02', title: 'Auto Pool Seeding',   desc: 'Court IQ reads DUPR ratings and seeds pools automatically. Draw is instant.' },
              { step: '03', title: 'Live Court Scoring',  desc: 'Umpire opens Court Desk on phone, taps to score each point live.' },
              { step: '04', title: 'Referee Confirmation',desc: 'After each match, referee gets a confirmation prompt. One tap approves the final result.' },
              { step: '05', title: 'Auto Advancement',    desc: 'Top 2 from each pool advance automatically. Playoff bracket is drawn in real time.' },
              { step: '06', title: 'DUPR CSV Export',     desc: 'All confirmed match results exported as DUPR-compatible CSV. One-click upload to DUPR dashboard.' },
            ].map((item, i) => (
              <div key={i} className="relative flex gap-6 mb-10 pl-20">
                <div className="absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:'rgba(168,214,52,0.1)', border:'1px solid rgba(168,214,52,0.3)'}}>
                  <span className="text-[#a8d634] font-black text-sm">{item.step}</span>
                </div>
                <div className="pt-3">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-white/50 text-sm mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight">Ready to run your next tournament?</h2>
          <p className="mt-4 text-white/50 text-lg">Join the smartest pickleball tournament organizers.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-10 px-10 py-5 rounded-xl bg-[#a8d634] text-[#1a1d2e] font-black text-xl hover:bg-[#c4e86a] transition-all glow-green-intense"
          >
            Get started free <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 text-center text-white/30 text-sm">
        <p>© 2026 Court IQ. Score it live. Run it smart.</p>
      </footer>
    </div>
  )
}
