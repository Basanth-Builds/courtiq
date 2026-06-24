'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CourtIQLogo } from '@/components/court-iq-logo'
import { PhoneInput } from '@/components/auth/phone-input'
import { OtpInput } from '@/components/auth/otp-input'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSendOtp(phoneNumber: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      })
      if (res.ok) {
        setPhone(phoneNumber)
        setStep('otp')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(otp: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })
      if (res.ok) {
        router.push('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-slate p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <CourtIQLogo className="h-12 w-auto" />
          <p className="text-sm text-muted-foreground">Score it live. Run it smart.</p>
        </div>
        <Card className="border-brand-slate-light bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 'phone' ? 'Welcome back' : 'Enter your code'}
            </CardTitle>
            <CardDescription>
              {step === 'phone'
                ? 'Enter your phone number to sign in or create your account.'
                : `We sent a 6-digit code to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <PhoneInput onSubmit={handleSendOtp} loading={loading} />
            ) : (
              <OtpInput onSubmit={handleVerifyOtp} loading={loading} onBack={() => setStep('phone')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
