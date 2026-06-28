'use client'

import { useEffect, useState } from 'react'
import { Phone, ArrowRight, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
]

const DEFAULT_COUNTRY = COUNTRIES[0]

interface Props {
  onSubmit: (phone: string) => void
  loading?: boolean
  error?: string | null
}

export function PhoneInput({ onSubmit, loading, error }: Props) {
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [dropOpen, setDropOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    async function detect() {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = (await res.json()) as { country_code?: string }
        const found = COUNTRIES.find((c) => c.code === data.country_code)
        if (found) setCountry(found)
      } catch {
        // fall back to default
      } finally {
        setDetecting(false)
      }
    }
    detect()
  }, [])

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  )

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const local = phone.replace(/^0/, '')
        onSubmit(`${country.dial}${local}`)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDropOpen((o) => !o)
                setSearch('')
              }}
              className="flex h-12 items-center gap-1.5 px-3 bg-surface border border-surface-border rounded-xl text-sm text-foreground hover:border-brand-green transition-colors min-w-[88px] whitespace-nowrap"
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

            {dropOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-surface-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-surface-border">
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full bg-background text-sm text-foreground placeholder:text-foreground-subtle px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>
                <ul className="max-h-52 overflow-y-auto py-1">
                  {filteredCountries.map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => {
                          setCountry(c)
                          setDropOpen(false)
                        }}
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
                    <li className="px-3 py-4 text-sm text-foreground-muted text-center">
                      No results
                    </li>
                  )}
                </ul>
              </div>
            )}
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
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
        disabled={loading || detecting || phone.length < 6}
      >
        {loading ? 'Sending code…' : 'Send verification code'}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  )
}
