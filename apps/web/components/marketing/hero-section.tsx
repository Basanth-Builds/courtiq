'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-slate min-h-screen flex items-center">
      {/* Animated court grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(168,214,52,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,214,52,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-green/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <Badge
            variant="outline"
            className="border-brand-green/40 bg-brand-green/10 text-brand-green px-4 py-1.5 text-sm"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Pickleball’s smartest tournament platform
          </Badge>

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Score it live.
            <br />
            <span className="text-brand-green">Run it smart.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-300 sm:text-xl">
            Court IQ automates everything — live scoring, pool seeding, playoff draws, and DUPR
            submission. One platform for umpires, referees, and tournament directors.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-14 px-8 bg-brand-green text-brand-slate font-bold hover:bg-brand-green-light text-base"
              asChild
            >
              <Link href="/dashboard">
                Start your tournament
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 border-white/20 text-white hover:bg-white/10 text-base"
              asChild
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 pt-8 border-t border-white/10 max-w-xl mx-auto">
            {[
              { icon: Trophy, label: 'Tournaments', value: '500+' },
              { icon: Users, label: 'Players tracked', value: '12K+' },
              { icon: Zap, label: 'Matches scored', value: '50K+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-brand-green">{value}</div>
                <div className="mt-1 text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
