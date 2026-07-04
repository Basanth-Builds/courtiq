import { NextRequest, NextResponse } from 'next/server'
import { updateMatch } from '@/lib/store'

// Admin password - in production, use environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(req: NextRequest) {
  const { matchId, updates, password } = await req.json()

  // Verify admin password
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  if (!matchId || !updates) {
    return NextResponse.json({ error: 'Missing matchId or updates' }, { status: 400 })
  }

  const success = updateMatch(matchId, updates)

  if (!success) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
