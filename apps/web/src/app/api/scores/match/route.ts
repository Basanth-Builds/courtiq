import { NextRequest, NextResponse } from 'next/server'
import { updateMatch } from '@/lib/store'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  // Verify admin authentication via cookie
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { matchId, updates } = await req.json()

  if (!matchId || !updates) {
    return NextResponse.json({ error: 'Missing matchId or updates' }, { status: 400 })
  }

  const success = updateMatch(matchId, updates)

  if (!success) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
