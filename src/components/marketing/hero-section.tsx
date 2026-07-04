'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Trophy, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-green/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-green/3 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-4 py-1.5 mb-8"
        >
          <Zap size={14} className="text-brand-green" />
          <span className="text-brand-green text-xs font-semibold tracking-wide uppercase">
            Built for Pickleball
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
        >
          Run smarter{' '}
          <span className="gradient-text">tournaments</span>
          <br />
          in real time
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-foreground-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Court IQ automates your entire pickleball tournament — from live scoring and pool seeding
          to playoff brackets and DUPR submissions. One platform. Zero chaos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/login"
            className="flex items-center gap-2 bg-brand-green text-brand-slate-dark font-semibold px-8 py-4 rounded-xl text-base hover:bg-brand-green-light transition-all hover:shadow-glow-strong active:scale-95"
          >
            Start your tournament
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#workflow"
            className="flex items-center gap-2 bg-surface border border-surface-border text-foreground font-medium px-8 py-4 rounded-xl text-base hover:bg-surface-hover transition-colors"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-foreground-muted text-sm"
        >
          {[
            { icon: Zap, label: 'Real-time scoring' },
            { icon: Trophy, label: 'Auto seeding & brackets' },
            { icon: Shield, label: 'DUPR ready' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={16} className="text-brand-green" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
