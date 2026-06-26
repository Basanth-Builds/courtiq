'use client'
// Thin wrapper — OtpInput for 6-digit codes
// Exists for backward-compat with any ghost file that imports OtpInput
import React from 'react'
import { cn } from '@/lib/utils'

export interface OtpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function OtpInput({ className, ...props }: OtpInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="000000"
      className={cn(
        'w-full bg-surface border border-surface-border rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-foreground focus:outline-none focus:border-brand-green transition-colors',
        className
      )}
      {...props}
    />
  )
}
