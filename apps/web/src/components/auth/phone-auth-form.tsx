'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, ChevronDown, Check } from 'lucide-react'

// ── Country list ────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States',   dial: '+1',   flag: '🇺🇸' },
  { code: 'IN', name: 'India',           dial: '+91',  flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom',  dial: '+44',  flag: '🇬🇧' },
  { code: 'CA', name: 'Canada',          dial: '+1',   flag: '🇨🇦' },
  { code: 'AU', name: 'Australia',       dial: '+61',  flag: '🇦🇺' },
  { code: 'DE', name: 'Germany',         dial: '+49',  flag: '🇩🇪' },
  { code: 'FR', name: 'France',          dial: '+33',  flag: '🇫🇷' },
  { code: 'JP', name: 'Japan',           dial: '+81',  flag: '🇯🇵' },
  { code: 'SG', name: 'Singapore',       dial: '+65',  flag: '🇸🇬' },
  { code: 'AE', name: 'UAE',             dial: '+971', flag: '🇦🇪' },
  { code: 'BR', name: 'Brazil',          dial: '+55',  flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico',          dial: '+52',  flag: '🇲🇽' },
  { code: 'NZ', name: 'New Zealand',     dial: '+64',  flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa',    dial: '+27',  flag: '🇿🇦' },
  { code: 'PH', name: 'Philippines',     dial: '+63',  flag: '🇵🇭' },
]

const DEFAULT_COUNTRY = COUNTRIES[0] // US

// ── Schemas ─────────────────────────────────────────────────
const phoneSchema = z.object({ phone: z.string().min(6, 'Enter a valid number') })
const otpSchema   = z.object({ otp: z.string().length(6, 'Enter the 6-digit code') })
type Step = 'phone' | 'otp'

// ── Component ───────────────────────────────────────────────
export function PhoneAuthForm() {
  const [step, setStep]           = useState<Step>('phone')
  const [phone, setPhone]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [country, setCountry]     = useState(DEFAULT_COUNTRY)
  const [dropOpen, setDropOpen]   = useState(false)
  const [search, setSearch]       = useState('')
  const [detecting, setDetecting] = useState(true)
  const router = useRouter()

  // Auto-detect country on mount via free IP geolocation
  useEffect(() => {
    async function detect() {
      try {
        const res  = await fetch('https://ipapi.co/json/')
        const data = await res.json() as { country_code?: string }
        const found = COUNTRIES.find(c => c.code === data.country_code)
        if (found) setCountry(found)
      } catch {
        // silently fall back to US
      } finally {
        setDetecting(false)
      }
    }
    detect()
  }, [])

  const phoneForm = useForm<{ phone: string }>({ resolver: zodResolver(phoneSchema) })
  const otpForm   = useForm<{ otp: string }>({ resolver: zodResolver(otpSchema) })

  const filteredCountries = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  )

  async function onPhoneSubmit(data: { phone: string }) {
    setLoading(true)
    setError(null)
    try {
      const fullPhone = `${country.dial}${data.phone.replace(/^0/, '')}`
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to send OTP')
      setPhone(fullPhone)
      setStep('otp')
    } catch {
      setError('Failed to send code. Try again.')
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
        code: data.otp,
        redirect: false,
      })
      if (result?.error) throw new Error(result.error)
      router.push('/dashboard')
    } catch {
      setError('Invalid code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Phone step ──────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="space-y-5">
        <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-foreground-muted mb-2 block">Phone number</label>

            {/* Input row */}
            <div className="flex gap-2">
              {/* Country selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setDropOpen(o => !o); setSearch('') }}
                  className="flex items-center gap-1.5 h-full px-3 bg-surface border border-surface-border rounded-xl text-sm text-foreground hover:border-brand-green transition-colors min-w-[88px] whitespace-nowrap"
                >
                  {detecting ? (
                    <span className="w-4 h-4 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="font-medium">{country.dial}</span>
                      <ChevronDown size={12} className="text-foreground-muted" />
                    </>
                  )}
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-surface-border rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-surface-border">
                      <input
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search country..."
                        className="w-full bg-background text-sm text-foreground placeholder:text-foreground-subtle px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </div>
                    {/* List */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                      {filteredCountries.map(c => (
                        <li key={c.code}>
                          <button
                            type="button"
                            onClick={() => { setCountry(c); setDropOpen(false) }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="flex-1 text-foreground">{c.name}</span>
                            <span className="text-foreground-muted">{c.dial}</span>
                            {c.code === country.code && (
                              <Check size={14} className="text-brand-green" />
                            )}
                          </button>
                        </li>
                      ))}
                      {filteredCountries.length === 0 && (
                        <li className="px-3 py-4 text-sm text-foreground-muted text-center">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Number input */}
              <input
                {...phoneForm.register('phone')}
                type="tel"
                placeholder="98765 43210"
                className="flex-1 bg-surface border border-surface-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-brand-green transition-colors"
              />
            </div>

            {phoneForm.formState.errors.phone && (
              <p className="text-destructive text-xs mt-1.5">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || detecting}
            className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-semibold py-3.5 rounded-xl hover:bg-brand-green-light transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <><span className="w-4 h-4 rounded-full border-2 border-brand-slate-dark border-t-transparent animate-spin" /> Sending...</>
            ) : (
              <> Send verification code <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-foreground-subtle text-xs">
          We\'ll send a one-time code via SMS.
        </p>
      </div>
    )
  }

  // ── OTP step ────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
        {/* Sent-to indicator */}
        <div className="flex items-center gap-3 bg-brand-green/10 border border-brand-green/20 rounded-xl px-4 py-3">
          <span className="text-lg">{country.flag}</span>
          <div>
            <p className="text-xs text-foreground-muted">Code sent to</p>
            <p className="text-sm font-semibold text-foreground">{phone}</p>
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
            <p className="text-destructive text-xs mt-1.5">
              {otpForm.formState.errors.otp.message}
            </p>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-green text-brand-slate-dark font-semibold py-3.5 rounded-xl hover:bg-brand-green-light transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <><span className="w-4 h-4 rounded-full border-2 border-brand-slate-dark border-t-transparent animate-spin" /> Verifying...</>
          ) : (
            'Verify & sign in'
          )}
        </button>

        <button
          type="button"
          onClick={() => { setStep('phone'); setError(null) }}
          className="w-full flex items-center justify-center gap-2 text-foreground-muted text-sm hover:text-foreground transition-colors py-1"
        >
          <RotateCcw size={13} />
          Use a different number
        </button>
      </form>
    </div>
  )
}
