'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
        return
      }
      const next = searchParams.get('next') ?? '/admin'
      router.push(next)
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1D2E]">
      <div className="w-full max-w-sm px-6 py-10 rounded-2xl bg-[#242638] border border-white/8 shadow-xl">
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">
          Court <span className="text-[#A8D634]">IQ</span>
        </h1>
        <p className="text-sm text-white/50 mb-8">Admin access</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="px-4 py-3 rounded-lg bg-[#1A1D2E] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#A8D634]/50"
              placeholder="Enter admin password"
            />
          </label>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-lg bg-[#A8D634] text-[#141520] font-bold text-sm hover:bg-[#C4E85A] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
