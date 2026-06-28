'use client'

import { useState } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  phone: string
  onSubmit: (otp: string) => void
  onBack: () => void
  loading?: boolean
  error?: string | null
}

export function OtpInput({ phone, onSubmit, onBack, loading, error }: Props) {
  const [otp, setOtp] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(otp)
      }}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10">
          <Shield className="h-6 w-6 text-brand-green" />
        </div>
        <p className="text-sm text-foreground-muted">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{phone}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="otp">6-digit code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="h-12 text-center text-2xl tracking-[0.5em] font-mono"
          required
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full h-12 bg-brand-green text-brand-slate font-bold hover:bg-brand-green-light"
        disabled={loading || otp.length !== 6}
      >
        {loading ? 'Verifying…' : 'Verify & sign in'}
      </Button>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Change phone number
      </button>
    </form>
  )
}
