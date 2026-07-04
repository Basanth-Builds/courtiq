import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-green/5 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Ready to run smarter tournaments?
            </h2>
            <p className="text-foreground-muted text-lg mb-8 max-w-xl mx-auto">
              Join tournament directors already using Court IQ to eliminate manual work and run tighter events.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-brand-green text-brand-slate-dark font-semibold px-8 py-4 rounded-xl text-base hover:bg-brand-green-light transition-all hover:shadow-glow-strong"
            >
              Get started free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
