'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Helper function to extract error message with proper typing
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'An unexpected error occurred'
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpType, setOtpType] = useState<'phone' | 'email'>('phone')
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Debug: Log Supabase config to verify env vars are loaded
  if (typeof window !== 'undefined') {
    console.log('[LOGIN DEBUG] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('[LOGIN DEBUG] Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }

  const handlePhoneLogin = async () => {
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      })

      if (error) throw error

      setShowOtpInput(true)
      setOtpType('phone')
      toast.success('OTP sent to your phone!')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast.success('Magic link sent to your email! Check your inbox.')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    setLoading(true)
    try {
      const verifyParams = otpType === 'phone' 
        ? { phone, token: otp, type: 'sms' as const }
        : { email, token: otp, type: 'email' as const }

      const { error } = await supabase.auth.verifyOtp(verifyParams)

      if (error) throw error

      toast.success('Successfully logged in!')
      router.push('/select-role')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (showOtpInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold">Enter OTP</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              We sent a code to your {otpType}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            <Button 
              onClick={handleOtpVerification}
              disabled={loading}
              className="w-full athletic-button"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowOtpInput(false)}
              className="w-full"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold neon-glow">CourtIQ</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to access your tournament dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="phone" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="phone" className="text-xs sm:text-sm">Phone</TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm">Email</TabsTrigger>
              <TabsTrigger value="google" className="text-xs sm:text-sm">Google</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phone" className="space-y-4">
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button 
                onClick={handlePhoneLogin}
                disabled={loading}
                className="w-full athletic-button"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full athletic-button"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </TabsContent>
            
            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full athletic-button"
              >
                {loading ? 'Redirecting...' : 'Continue with Google'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}