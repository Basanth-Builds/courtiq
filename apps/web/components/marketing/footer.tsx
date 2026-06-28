import { CourtIQLogo } from '@/components/court-iq-logo'

export function MarketingFooter() {
  return (
    <footer className="bg-brand-slate border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <CourtIQLogo showTagline />
          <p className="text-sm text-gray-500">© 2026 Court IQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
