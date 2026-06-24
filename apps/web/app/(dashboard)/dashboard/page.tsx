import { Trophy, Users, Zap, BarChart3, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  const stats = [
    { label: 'Active Tournaments', value: '3', icon: Trophy, change: '+1 this week' },
    { label: 'Total Players', value: '248', icon: Users, change: '+12 today' },
    { label: 'Matches Today', value: '36', icon: Zap, change: '18 completed' },
    { label: 'DUPR Pending', value: '4', icon: BarChart3, change: 'Needs review' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Welcome back. Here's what's happening.</p>
        </div>
        <Link
          href="/tournaments/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#a8d634] text-[#1a1d2e] font-semibold text-sm hover:bg-[#c4e86a] transition-all"
        >
          <Plus className="w-4 h-4" /> New Tournament
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wide">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-[#a8d634]" />
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-xs text-white/40 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="font-bold text-white mb-4">Active Tournaments</h2>
          <div className="space-y-3">
            {['Mumbai Open 2026', 'Thane Pickleball League', 'Coastal Cup'].map((t) => (
              <div key={t} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#a8d634]" />
                  <span className="text-sm font-medium text-white">{t}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="font-bold text-white mb-4">DUPR Pending Approval</h2>
          <div className="space-y-3">
            {[
              { match: 'Court 1 — Singles Final', time: '2 mins ago' },
              { match: 'Court 3 — Mixed Doubles R2', time: '15 mins ago' },
              { match: 'Court 2 — Mens Doubles QF', time: '32 mins ago' },
              { match: 'Court 4 — Womens Singles', time: '1 hr ago' },
            ].map((item) => (
              <div key={item.match} className="flex items-center justify-between p-3 rounded-lg bg-[#a8d634]/5 border border-[#a8d634]/10 hover:bg-[#a8d634]/10 transition-all cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-white">{item.match}</div>
                  <div className="text-xs text-white/40 mt-0.5">{item.time}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-[#a8d634]/20 text-[#a8d634] font-medium">Review</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
