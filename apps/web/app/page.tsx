import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { StatsSection } from '@/components/marketing/stats-section'
import { CTASection } from '@/components/marketing/cta-section'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-court-dark">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <StatsSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}
