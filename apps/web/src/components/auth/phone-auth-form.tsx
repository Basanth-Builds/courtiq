'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth'
import { ArrowRight, RotateCcw, ChevronDown, Check, Shield } from 'lucide-react'

// ── Country list ────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States',  dial: '+1',   flag: '🇺🇸' },
  { code: 'IN', name: 'India',          dial: '+91',  flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', dial: '+44',  flag: '🇬🇧' },
  { code: 'CA', name: 'Canada',         dial: '+1',   flag: '🇨🇦' },
  { code: 'AU', name: 'Australia',      dial: '+61',  flag: '🇦🇺' },
  { code: 'DE', name: 'Germany',        dial: '+49',  flag: '🇩🇪' },
  { code: 'FR', name: 'France',         dial: '+33',  flag: '🇫🇷' },
  { code: 'JP', name: 'Japan',          dial: '+81',  flag: '🇯🇵' },
  { code: 'SG', name: 'Singapore',      dial: '+65',  flag: '🇸🇬' },
  { code: 'AE', name: 'UAE',            dial: '+971', flag: '🇦🇪' },
  { code: 'BR', name: 'Brazil',         dial: '+55',  flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico',         dial: '+52',  flag: '🇲🇽' },
  { code: 'NZ', name: 'New Zealand',    dial: '+64',  flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa',   dial: '+27',  flag: '🇿🇦' },
  { code: 'PH', name: 'Philippines',    dial: '+63',  flag: '🇵🇭' },
]
const DEFAULT_COUNTRY = COUNTRIES[0]

// ── Schemas ────────────────────────────────────────────────
const phoneSchema = z.object({ phone: z.string().min(6, 'Enter a valid number') })
const otpSchema   = z.object({ otp: z.string().length(6, 'Enter the 6-digit code') })
type Step = 'phone' | 'otp'

export function PhoneAuthForm() {
  const [step, setStep]                   = useState<Step>('phone')
  const [fullPhone, setFullPhone]         = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [country, setCountry]             = useState(DEFAULT_COUNTRY)
  const [dropOpen, setDropOpen]           = useState(false)
  const [search, setSearch]               = useState('')
  const [detecting, setDetecting]         = useState(true)
  const confirmationRef                   = useRef<ConfirmationResult | null>(null)
  const recaptchaRef                      = useRef<RecaptchaVerifier | null>(null)
  const router = useRouter()

  const phoneForm = useForm<{ phone: string }>({ resolver: zodResolver(phoneSchema) })
  const otpForm   = useForm<{ otp: string }>({ resolver: zodResolver(otpSchema) })

  // Auto-detect country
  useEffect(() => {
    async function detect() {
      try {
        const res  = await fetch('https://ipapi.co/json/')
        const data = await res.json() as { country_code?: string }
        const found = COUNTRIES.find(c => c.code === data.country_code)
        if (found) setCountry(found)
      } catch { /* fall back to US */ }
      finally { setDetecting(false) }
    }
    detect()
  }, [])

  // Init invisible reCAPTCHA (required by Firebase Phone Auth)
  function ensureRecaptcha() {
    if (recaptchaRef.current) return recaptchaRef.current
    const { firebaseAuth } = require('@/lib/firebase-client')
    const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
      size: 'invisible',
    })
    recaptchaRef.current = verifier
    return verifier
  }

  const filtered = COUNTRIES.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  )

  // ── Step 1: Send OTP via Firebase ────────────────────────
  async function onPhoneSubmit(data: { phone: string }) {
    setLoading(true)
    setError(null)
    try {
      const phone = `${country.dial}${data.phone.replace(/^0+/, '')}`
      const { firebaseAuth } = await import('@/lib/firebase-client')
      const verifier = ensureRecaptcha()
      const confirmation = await signInWithPhoneNumber(firebaseAuth, phone, verifier)
      confirmationRef.current = confirmation
      setFullPhone(phone)
      setStep('otp')
    } catch (e: any) {
      console.error(e)
      // Reset reCAPTCHA on error so user can retry
      recaptchaRef.current?.clear()
      recaptchaRef.current = null
      setError(e?.message ?? 'Failed to send code. Check the number and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP → get Firebase ID token → NextAuth session ─
  async function onOtpSubmit(data: { otp: string }) {
    setLoading(true)
    setError(null)
    try {
      if (!confirmationRef.current) throw new Error('Session expired. Go back and resend.')

      // Confirm OTP with Firebase — this verifies the code
      const result  = await confirmationRef.current.confirm(data.otp)
      const idToken = await result.user.getIdToken()

      // Verify token server-side and sign into NextAuth
      const verifyRes = await fetch('/api/auth/verify-firebase-token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      })
      if (!verifyRes.ok) throw new Error('Token verification failed')
      const { phone } = await verifyRes.json() as { phone: string }

      const signInResult = await signIn('credentials', {
        phone,
        idToken,
        redirect: false,
      })
      if (signInResult?.error) throw new Error(signInResult.error)

      router.push('/dashboard')
    } catch (e: any) {
      setError(e?.message ?? 'Invalid code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Phone step UI ───────────────────────────────────────
  if (step === 'phone') return (
    <div className="space-y-5">
      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
        <div>
          <label className="text-sm text-foreground-muted mb-2 block">Phone number</label>
          <div className="flex gap-2">

            {/* Country selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setDropOpen(o => !o); setSearch('') }}
                className="flex items-center gap-1.5 h-full px-3 bg-surface border border-surface-border rounded-xl text-sm text-foreground hover:border-brand-green transition-colors min-w-[92px]"
              >
                {detecting
                  ? <span className="w-4 h-4 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
                  : <>
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium">{country.dial}</span>
                      <ChevronDown size={12} className="text-foreground-muted" />
                    </>
                }
              </button>

              {dropOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-surface-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-surface-border">
                    <input
                      autoFocus
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search country..."
                      className="w-full bg-background text-sm text-foreground placeholder:text-foreground-subtle px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green"
                    />
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filtered.map(c => (
                      <li key={c.code}>
                        <button
                          type="button"
                          onClick={() => { setCountry(c); setDropOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-hover transition-colors"
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="flex-1 text-foreground">{c.name}</span>
                          <span className="text-foreground-muted text-xs">{c.dial}</span>
                          {c.code === country.code && <Check size={13} className="text-brand-green" />}
                        </button>
                      </li>
                    ))}
                    {filtered.length === 0 && (
                      <li className="px-3 py-4 text-sm text-foreground-muted text-center">No results</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Number field */}
            <input
              {...phoneForm.register('phone')}
              type="tel"
              placeholder="98765 43210"
              className="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>

          {phoneForm.formState.errors.phone && (
            <p className="text-destructive text-xs mt-1.5">{phoneForm.formState.errors.phone.message}</p>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || detecting}
          className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-semibold py-3.5 rounded-xl hover:bg-brand-green-light transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
        >
          {loading
            ? <><span className="w-4 h-4 rounded-full border-2 border-brand-slate-dark border-t-transparent animate-spin" /> Sending...</>
            : <>Send verification code <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="flex items-center justify-center gap-1.5 text-foreground-subtle text-xs">
        <Shield size={11} />
        <span>Secured by Firebase • No password needed</span>
      </div>
    </div>
  )

  // ── OTP step UI ─────────────────────────────────────────
  return (
    <div className="space-y-5">
      <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
        <div className="flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 rounded-xl px-4 py-3">
          <span className="text-xl">{country.flag}</span>
          <div>
            <p className="text-xs text-foreground-muted">Code sent to</p>
            <p className="text-sm font-semibold text-foreground">{fullPhone}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-foreground-muted mb-2 block">Verification code</label>
          <input
            {...otpForm.register('otp')}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            autoFocus
            className="w-full bg-surface border border-surface-border rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.6em] text-foreground focus:outline-none focus:border-brand-green transition-colors"
          />
          {otpForm.formState.errors.otp && (
            <p className="text-destructive text-xs mt-1.5">{otpForm.formState.errors.otp.message}</p>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-semibold py-3.5 rounded-xl hover:bg-brand-green-light transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
        >
          {loading
            ? <><span className="w-4 h-4 rounded-full border-2 border-brand-slate-dark border-t-transparent animate-spin" /> Verifying...</>
            : 'Verify & sign in'}
        </button>

        <button
          type="button"
          onClick={() => { setStep('phone'); setError(null); confirmationRef.current = null }}
          className="w-full flex items-center justify-center gap-2 text-foreground-muted text-sm hover:text-foreground transition-colors py-1"
        >
          <RotateCcw size={13} /> Use a different number
        </button>
      </form>
    </div>
  )
}
