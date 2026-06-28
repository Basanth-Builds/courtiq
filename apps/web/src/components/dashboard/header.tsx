'use client'

import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'

export function DashboardHeader() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role ?? 'user'

  return (
    <header className="h-16 border-b border-surface-border bg-background-secondary px-6 flex items-center justify-between flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-green rounded-full" />
        </button>
        <div className="flex items-center gap-2 bg-surface border border-surface-border rounded-xl px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-brand-green/20 flex items-center justify-center">
            <span className="text-brand-green text-xs font-bold">
              {session?.user?.name?.[0] ?? '?'}
            </span>
          </div>
          <span className="text-sm text-foreground-muted capitalize">{role}</span>
        </div>
      </div>
    </header>
  )
}
