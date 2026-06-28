'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Workflow', 'Pricing', 'Docs'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-foreground-muted hover:text-foreground text-sm font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="bg-brand-green text-brand-slate-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-green-light transition-colors"
            >
              Get started
            </Link>
          </div>
          <button
            className="md:hidden text-foreground-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-background-secondary px-4 py-4 space-y-3">
          {['Features', 'Workflow', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block text-foreground-muted hover:text-foreground text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </a>
          ))}
          <Link
            href="/login"
            className="block w-full bg-brand-green text-brand-slate-dark text-sm font-semibold px-4 py-2 rounded-lg text-center mt-2"
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  )
}
