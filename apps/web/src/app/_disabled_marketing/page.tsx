import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { WorkflowSection } from '@/components/marketing/workflow-section'
import { StatsSection } from '@/components/marketing/stats-section'
import { CTASection } from '@/components/marketing/cta-section'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background court-pattern">
      <MarketingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <MarketingFooter />
    </div>
  )
}
