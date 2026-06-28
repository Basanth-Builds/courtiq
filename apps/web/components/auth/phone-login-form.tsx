'use client'

import { useState } from 'react'
import { ArrowRight, Phone, Shield } from 'lucide-react'

export function PhoneLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setStep('otp')
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    window.location.href = '/dashboard'
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#a8d634]/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#a8d634]" />
          </div>
          <p className="text-sm text-white/60">
            We sent a 6-digit code to <span className="text-white font-medium">{phone}</span>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] font-bold placeholder:text-white/20 focus:outline-none focus:border-[#a8d634]/50 focus:ring-1 focus:ring-[#a8d634]/20"
          />
        </div>
        <button
          type="submit"
          disabled={otp.length < 6 || loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#a8d634] text-[#1a1d2e] font-bold hover:bg-[#c4e86a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify & Sign in'} <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="w-full text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Use a different number
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handlePhoneSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Phone number</label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium whitespace-nowrap">
            🇮🇳 +91
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#a8d634]/50 focus:ring-1 focus:ring-[#a8d634]/20"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={phone.length < 10 || loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#a8d634] text-[#1a1d2e] font-bold hover:bg-[#c4e86a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Phone className="w-4 h-4" />
        {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  )
}
