'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green">
            <span className="text-xs font-black text-white">IQ</span>
          </div>
          <span className="text-xl tracking-tight">
            Court <span className="text-brand-green">IQ</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="bg-brand-green hover:bg-brand-green-dark text-white font-semibold">
              Get started free
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link href="/#features" onClick={() => setOpen(false)}>Features</Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link>
            <Link href="/#pricing" onClick={() => setOpen(false)}>Pricing</Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/auth/login"><Button variant="outline" className="w-full">Sign in</Button></Link>
              <Link href="/auth/register"><Button className="w-full bg-brand-green hover:bg-brand-green-dark text-white">Get started free</Button></Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
