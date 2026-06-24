import Link from 'next/link'
import { PhoneLoginForm } from '@/components/auth/phone-login-form'

export const metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-court-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight">
            Court <span className="text-gradient">IQ</span>
          </h1>
          <p className="mt-2 text-white/50 text-sm">Score it live. Run it smart.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
          <h2 className="text-xl font-bold mb-2">Welcome back</h2>
          <p className="text-white/50 text-sm mb-8">Enter your phone number to sign in or create an account.</p>
          <PhoneLoginForm />
        </div>

        <p className="text-center mt-6 text-white/30 text-xs">
          By signing in you agree to our{' '}
          <Link href="/terms" className="text-[#a8d634]/70 hover:text-[#a8d634]">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#a8d634]/70 hover:text-[#a8d634]">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
