'use client'

import { useEffect, useRef, useState } from 'react'
import type { ConfirmationResult } from 'firebase/auth'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PhoneInput } from '@/components/auth/phone-input'
import { OtpInput } from '@/components/auth/otp-input'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import {
  ensureRecaptcha,
  mapFirebaseAuthError,
  resetRecaptcha,
  sendPhoneOtp,
} from '@/lib/firebase/phone-auth'

type Step = 'phone' | 'otp'

export function PhoneLoginForm() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recaptchaLoading, setRecaptchaLoading] = useState(false)
  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (step !== 'phone' || !isFirebaseConfigured()) return

    let cancelled = false
    setRecaptchaLoading(true)
    setError(null)

    ensureRecaptcha('recaptcha-container')
      .catch((err) => {
        if (!cancelled) {
          console.error('[Court IQ] reCAPTCHA init failed:', err)
          setError(mapFirebaseAuthError(err))
        }
      })
      .finally(() => {
        if (!cancelled) setRecaptchaLoading(false)
      })

    return () => {
      cancelled = true
      resetRecaptcha()
    }
  }, [step])

  async function handlePhoneSubmit(rawPhone: string) {
    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { confirmation, formattedPhone } = await sendPhoneOtp(
        rawPhone,
        'recaptcha-container'
      )
      confirmationRef.current = confirmation
      setPhone(formattedPhone)
      setStep('otp')
    } catch (err) {
      console.error('[Court IQ] send OTP failed:', err)
      setError(mapFirebaseAuthError(err))
      resetRecaptcha()
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(code: string) {
    if (!confirmationRef.current) {
      setError('Session expired. Request a new code.')
      setStep('phone')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const credential = await confirmationRef.current.confirm(code)
      const idToken = await credential.user.getIdToken()

      const result = await signIn('credentials', {
        idToken,
        redirect: false,
      })

      if (result?.error) {
        const authErrors: Record<string, string> = {
          Configuration: 'Server auth misconfigured. Run `pnpm db:generate` and restart the dev server.',
          CredentialsSignin: 'Sign-in failed. Your verification code may have expired — try again.',
        }
        throw new Error(authErrors[result.error] ?? result.error)
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('[Court IQ] verify OTP failed:', err)
      setError(mapFirebaseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    confirmationRef.current = null
    resetRecaptcha()
    setError(null)
    setStep('phone')
  }

  return (
    <div className="space-y-4">
      {step === 'phone' && (
        <div className="space-y-2">
          <div id="recaptcha-container" className="flex min-h-[78px] justify-center" />
          {recaptchaLoading && (
            <p className="text-center text-xs text-foreground-muted">Loading security check…</p>
          )}
        </div>
      )}
      {step === 'phone' ? (
        <PhoneInput
          onSubmit={handlePhoneSubmit}
          loading={loading || recaptchaLoading}
          error={error}
        />
      ) : (
        <OtpInput
          phone={phone}
          onSubmit={handleOtpSubmit}
          onBack={handleBack}
          loading={loading}
          error={error}
        />
      )}
    </div>
  )
}
