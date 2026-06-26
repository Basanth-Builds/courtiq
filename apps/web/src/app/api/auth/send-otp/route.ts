import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ phone: z.string().min(7) })

// In-memory OTP store for dev (no DB required)
// In production this is replaced by DB + Twilio Verify
const devOtpStore = new Map<string, { code: string; expiresAt: number }>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const { phone } = parsed.data
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    const isDev = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL

    if (isDev) {
      // Dev mode: store in memory, log to console
      devOtpStore.set(phone, { code, expiresAt })
      console.log(`\n📱 [Court IQ Dev OTP] Phone: ${phone}  Code: ${code}\n`)
      return NextResponse.json({ success: true, dev: true })
    }

    // Production: use DB + Twilio
    try {
      const { userRepository } = await import('@court-iq/db')
      await userRepository.createOtpSession(phone, code, new Date(expiresAt))

      const { sendOtp } = await import('@court-iq/auth')
      const result = await sendOtp(phone)
      if (!result.success) {
        return NextResponse.json({ error: result.error ?? 'Failed to send OTP' }, { status: 500 })
      }
    } catch (e) {
      console.error('[Court IQ] OTP send failed:', e)
      return NextResponse.json({ error: 'OTP service unavailable' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[Court IQ] /api/auth/send-otp error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Export store so the credentials provider can verify in dev
export { devOtpStore }
