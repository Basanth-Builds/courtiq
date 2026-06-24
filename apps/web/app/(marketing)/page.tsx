import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { SocialProofSection } from '@/components/marketing/social-proof-section'
import { CtaSection } from '@/components/marketing/cta-section'
import { MarketingNav } from '@/components/marketing/nav'
import { MarketingFooter } from '@/components/marketing/footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
