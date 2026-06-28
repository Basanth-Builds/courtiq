import { Logo } from '@/components/ui/logo'

export function MarketingFooter() {
  return (
    <footer className="border-t border-surface-border bg-background-secondary py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-foreground-muted text-sm">
            © 2026 Court IQ. Score it live. Run it smart.
          </p>
          <div className="flex gap-6 text-foreground-muted text-sm">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
