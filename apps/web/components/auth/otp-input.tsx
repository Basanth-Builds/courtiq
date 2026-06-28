'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

interface Props {
  onSubmit: (otp: string) => void
  onBack: () => void
  loading?: boolean
}

export function OtpInput({ onSubmit, onBack, loading }: Props) {
  const [otp, setOtp] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(otp)
      }}
    >
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
