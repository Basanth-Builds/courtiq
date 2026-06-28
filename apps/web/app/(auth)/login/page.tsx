// Synced with src/app/(auth)/login/page.tsx — ghost copy kept identical to avoid stale cache conflicts
import { PhoneAuthForm } from '@/components/auth/phone-auth-form'
import { Logo } from '@/components/ui/logo'

export const metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background court-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-foreground-muted text-sm mb-8">
            Enter your phone number to continue
          </p>
          <PhoneAuthForm />
        </div>
      </div>
    </div>
  )
}
