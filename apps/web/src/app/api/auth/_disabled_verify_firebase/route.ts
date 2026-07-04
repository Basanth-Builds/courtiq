// Receives a Firebase ID token from the client after phone OTP verification.
// Verifies it with Firebase Admin, then exchanges for a NextAuth session.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ idToken: z.string().min(10) })

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const { adminAuth } = await import('@/lib/firebase-admin')
    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken)

    // decoded.phone_number is the verified E.164 phone number
    const phone = decoded.phone_number
    if (!phone) {
      return NextResponse.json({ error: 'No phone number in token' }, { status: 400 })
    }

    return NextResponse.json({ success: true, phone })
  } catch (e: any) {
    console.error('[Court IQ] Firebase token verification failed:', e?.message)
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}
