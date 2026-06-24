'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CourtIQLogo } from '@/components/court-iq-logo'
import {
  LayoutDashboard,
  Trophy,
  ClipboardCheck,
  Radio,
  Settings,
  LogOut,
} from 'lucide-react'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tournament', icon: Trophy, label: 'Tournaments' },
  { href: '/referee', icon: ClipboardCheck, label: 'Referee Console' },
  { href: '/live', icon: Radio, label: 'Live View' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-border/50 bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-border/50 px-6">
        <CourtIQLogo />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              pathname.startsWith(href)
                ? 'bg-brand-green/15 text-brand-green'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/50 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
