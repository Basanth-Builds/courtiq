import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="bg-brand-green py-24">
      <div className="mx-auto max-w-3xl px-6 text-center space-y-6">
        <h2 className="text-4xl font-bold tracking-tight text-brand-slate sm:text-5xl">
          Ready to run smarter tournaments?
        </h2>
        <p className="text-lg text-brand-slate/80">
          Join tournament directors who’ve already switched to Court IQ.
        </p>
        <Button
          size="lg"
          className="h-14 px-10 bg-brand-slate text-white hover:bg-brand-slate-dark text-base font-bold"
          asChild
        >
          <Link href="/login">
            Get started free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
