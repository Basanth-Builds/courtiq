'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CourtIQLogo } from '@/components/court-iq-logo'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-brand-slate/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <CourtIQLogo />
        <div className="hidden items-center gap-8 sm:flex">
          <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">How it works</Link>
          <Button variant="ghost" className="text-gray-300 hover:text-white" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button className="bg-brand-green text-brand-slate hover:bg-brand-green-light font-semibold" asChild>
            <Link href="/login">Get started</Link>
          </Button>
        </div>
        <button className="sm:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="sm:hidden bg-brand-slate border-t border-white/10 px-6 py-4 space-y-4">
          <Link href="#features" className="block text-sm text-gray-300">Features</Link>
          <Link href="#how-it-works" className="block text-sm text-gray-300">How it works</Link>
          <Link href="/login" className="block text-sm text-white font-semibold">Sign in →</Link>
        </div>
      )}
    </nav>
  )
}
