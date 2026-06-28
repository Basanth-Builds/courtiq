'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function DashboardTopbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tournaments, players..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-green text-brand-slate text-xs">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
