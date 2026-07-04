'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, AlertCircle } from 'lucide-react'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/admin'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push(next)
      } else {
        setError('Invalid password. Please try again.')
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1D2E] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#A8D634]/20 border border-[#A8D634]/30 mb-4">
            <Shield className="w-8 h-8 text-[#A8D634]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Court <span className="text-[#A8D634]">IQ</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#0F1117] border border-white/8 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1D2E] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#A8D634]/50 focus:border-[#A8D634]/50"
                placeholder="Enter admin password"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#A8D634] hover:bg-[#95c129] disabled:bg-[#A8D634]/50 disabled:cursor-not-allowed text-[#1A1D2E] font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8">
            <a
              href="/"
              className="text-sm text-white/50 hover:text-white/70 transition-colors inline-flex items-center justify-center w-full"
            >
              ← Back to Spectator View
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A1D2E] flex items-center justify-center px-4">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
