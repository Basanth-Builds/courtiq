'use client'
// Thin wrapper — PhoneInput maps to the phone field inside PhoneAuthForm
// Exists for backward-compat with any ghost file that imports PhoneInput
import React from 'react'
import { cn } from '@/lib/utils'
import { Phone } from 'lucide-react'

export interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PhoneInput({ className, ...props }: PhoneInputProps) {
  return (
    <div className="relative">
      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
      <input
        type="tel"
        placeholder="+1 (555) 000-0000"
        className={cn(
          'w-full bg-surface border border-surface-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-brand-green transition-colors',
          className
        )}
        {...props}
      />
    </div>
  )
}
