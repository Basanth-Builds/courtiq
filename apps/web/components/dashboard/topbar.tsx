'use client'

import { Bell, Menu } from 'lucide-react'

export function TopBar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#1a1d2e]/80 backdrop-blur-sm">
      <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-all">
        <Menu className="w-5 h-5 text-white/70" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-all">
          <Bell className="w-5 h-5 text-white/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#a8d634]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#a8d634]/20 border border-[#a8d634]/30 flex items-center justify-center">
          <span className="text-xs font-bold text-[#a8d634]">A</span>
        </div>
      </div>
    </header>
  )
}
