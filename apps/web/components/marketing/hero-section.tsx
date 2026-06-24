'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-court-dark py-24 md:py-36">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-green/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4 text-center">
        <Badge
          variant="outline"
          className="mb-6 border-brand-green/30 bg-brand-green/10 text-brand-green hover:bg-brand-green/20"
        >
          <Zap size={12} className="mr-1" />
          Pickleball tournament automation is here
        </Badge>

        <h1 className="font-display text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
          Score it live.
          <br />
          <span className="text-gradient-green">Run it smart.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 md:text-xl">
          Court IQ automates every step of your pickleball tournament — from real-time scoring and seeding to playoff draws and DUPR submissions. One platform, zero chaos.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth/register">
            <Button
              size="lg"
              className="h-12 rounded-full bg-brand-green px-8 text-base font-bold text-white hover:bg-brand-green-dark animate-pulse-green"
            >
              Start for free
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/20 px-8 text-base text-white hover:bg-white/10"
            >
              See how it works
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
          {[
            { icon: Zap,        label: 'Live scoring in real time' },
            { icon: BarChart3,  label: 'Auto DUPR submission' },
            { icon: Shield,     label: 'Two-step confirmation' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-white/50">
              <Icon size={16} className="text-brand-green" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Mock score card */}
        <div className="mx-auto mt-20 max-w-md animate-slide-up">
          <div className="court-card overflow-hidden rounded-2xl border-brand-green/20 bg-brand-slate/80 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="status-live">● LIVE</span>
              <span className="text-xs text-white/40">Court 3 · Pool A</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-white/70">Team Smash</p>
                <p className="score-display mt-2 text-6xl text-white">9</p>
              </div>
              <div className="text-2xl font-black text-brand-green">vs</div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-white/70">Net Ninjas</p>
                <p className="score-display mt-2 text-6xl text-brand-green">11</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[55%] rounded-full bg-brand-green transition-all duration-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
