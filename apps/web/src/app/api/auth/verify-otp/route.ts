import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  phone: z.string().min(7),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { phone, code } = parsed.data
    const isDev = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL

    if (isDev) {
      // In dev, accept code 000000 always, or whatever was generated
      if (code === '000000') {
        return NextResponse.json({ success: true })
      }
      // Check in-memory store
      const { devOtpStore } = await import('../send-otp/route')
      const entry = devOtpStore.get(phone)
      if (!entry || entry.expiresAt < Date.now()) {
        return NextResponse.json({ error: 'Code expired or not found' }, { status: 401 })
      }
      if (entry.code !== code) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
      }
      devOtpStore.delete(phone)
      return NextResponse.json({ success: true })
    }

    // Production: verify against DB
    const { userRepository } = await import('@court-iq/db')
    const session = await userRepository.verifyOtpSession(phone, code)
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[Court IQ] /api/auth/verify-otp error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
