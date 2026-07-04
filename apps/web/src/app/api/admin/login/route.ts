import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminToken, verifyAdminPassword } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  let password: string
  try {
    const body = await req.json()
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const valid = await verifyAdminPassword(password)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await adminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // Secure only in production
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ADMIN_COOKIE)
  return res
}
