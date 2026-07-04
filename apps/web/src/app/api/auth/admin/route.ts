import { NextRequest, NextResponse } from 'next/server'
import { adminToken } from '@/lib/admin-auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'D!nk$'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  if (password === ADMIN_PASSWORD) {
    const token = await adminToken()
    const response = NextResponse.json({ authenticated: true })
    
    // Set secure HTTP-only cookie
    response.cookies.set('ciq_admin', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    return response
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
