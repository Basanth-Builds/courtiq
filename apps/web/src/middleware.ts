import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-auth'

export const config = {
  matcher: ['/admin/:path*'],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Let the login page through so the user can authenticate.
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? ''
  const valid = token ? await verifyAdminToken(token) : false

  if (!valid) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
