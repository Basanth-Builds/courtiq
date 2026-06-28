'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, Zap, Shield, BarChart3, Settings, Users } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/court-desk', label: 'Court Desk', icon: Zap },
  { href: '/referee', label: 'Referee', icon: Shield },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-[#1a1d2e] border-r border-white/5 p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-black tracking-tight">
          Court <span className="text-gradient">IQ</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-[#a8d634]/10 text-[#a8d634] border border-[#a8d634]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-4 p-3 rounded-xl bg-[#a8d634]/5 border border-[#a8d634]/10">
        <div className="text-xs font-bold text-[#a8d634] mb-1">Court IQ Beta</div>
        <div className="text-xs text-white/40">v0.1.0 — dev build</div>
      </div>
    </aside>
  )
}
