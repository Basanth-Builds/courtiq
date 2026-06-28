'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  onSubmit: (phone: string) => void
  loading?: boolean
}

export function PhoneInput({ onSubmit, loading }: Props) {
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
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-brand-green text-brand-slate font-bold hover:bg-brand-green-light"
        disabled={loading || phone.length < 10}
      >
        {loading ? 'Sending code…' : 'Send verification code'}
      </Button>
    </form>
  )
}
