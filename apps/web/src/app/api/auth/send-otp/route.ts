import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { devOtpStore } from '@/lib/dev-otp-store'

const schema = z.object({ phone: z.string().min(7) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const { phone } = parsed.data
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000

    const isDev = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL

    if (isDev) {
      devOtpStore.set(phone, { code, expiresAt })
      console.log(`\n\x1b[32m📱 [Court IQ OTP]\x1b[0m Phone: ${phone}  Code: \x1b[33m${code}\x1b[0m\n`)
      return NextResponse.json({ success: true, dev: true })
    }

    // Production: DB + Twilio
    const { userRepository } = await import('@court-iq/db')
    await userRepository.createOtpSession(phone, code, new Date(expiresAt))

    const { sendOtp } = await import('@court-iq/auth')
    const result = await sendOtp(phone)
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[Court IQ] /api/auth/send-otp error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
