'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, RotateCcw } from 'lucide-react'

const phoneSchema = z.object({ phone: z.string().min(10, 'Enter a valid phone number') })
const otpSchema = z.object({ otp: z.string().length(6, 'Enter the 6-digit code') })

type Step = 'phone' | 'otp'

export function PhoneAuthForm() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const phoneForm = useForm<{ phone: string }>({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm<{ otp: string }>({ resolver: zodResolver(otpSchema) })

  async function onPhoneSubmit(data: { phone: string }) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: data.phone }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to send OTP')
      setPhone(data.phone)
      setStep('otp')
    } catch (e) {
      setError('Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function onOtpSubmit(data: { otp: string }) {
    setLoading(true)
    setError(null)
    try {
      const result = await signIn('credentials', {
        phone,
        otp: data.otp,
        redirect: false,
      })
      if (result?.error) throw new Error(result.error)
      router.push('/dashboard')
    } catch (e) {
      setError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-foreground-muted mb-1.5 block">Phone number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                {...phoneForm.register('phone')}
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full bg-surface border border-surface-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-brand-green transition-colors"
              />
            </div>
            {phoneForm.formState.errors.phone && (
              <p className="text-destructive text-xs mt-1">{phoneForm.formState.errors.phone.message}</p>
            )}
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-semibold py-3 rounded-xl hover:bg-brand-green-light transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send verification code'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
          <p className="text-foreground-muted text-sm">
            We sent a 6-digit code to <span className="text-foreground font-medium">{phone}</span>
          </p>
          <div>
            <label className="text-sm text-foreground-muted mb-1.5 block">Verification code</label>
            <input
              {...otpForm.register('otp')}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground focus:outline-none focus:border-brand-green transition-colors"
            />
            {otpForm.formState.errors.otp && (
              <p className="text-destructive text-xs mt-1">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-semibold py-3 rounded-xl hover:bg-brand-green-light transition-colors disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify & sign in'}
          </button>
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full flex items-center justify-center gap-2 text-foreground-muted text-sm hover:text-foreground transition-colors"
          >
            <RotateCcw size={14} />
            Use a different number
          </button>
        </form>
      )}
    </div>
  )
}
