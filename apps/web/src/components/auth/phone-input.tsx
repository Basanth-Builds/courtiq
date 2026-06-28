'use client'

import { useState } from 'react'
import { Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  onSubmit: (phone: string) => void
  loading?: boolean
  error?: string | null
}

export function PhoneInput({ onSubmit, loading, error }: Props) {
  const [phone, setPhone] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(phone)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 rounded-xl bg-surface border border-surface-border text-foreground-muted text-sm font-medium whitespace-nowrap">
            🇮🇳 +91
          </div>
          <div className="relative flex-1">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
            />
            <Input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="h-12 pl-9 text-base"
              required
            />
          </div>
        </div>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full h-12 bg-brand-green text-brand-slate font-bold hover:bg-brand-green-light"
        disabled={loading || phone.length < 10}
      >
        {loading ? 'Sending code…' : 'Send verification code'}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  )
}
