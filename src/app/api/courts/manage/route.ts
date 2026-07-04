import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { assignMatchToCourt, clearCourt, updateCourtStatus } from '@/lib/court-management'
import type { D1Database } from '@/lib/d1-store'

interface Env {
  DB?: D1Database
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAdmin = token ? await verifyAdminToken(token) : false
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, courtId, matchId, status } = body
    const env = (req as any).cloudflare?.env as Env | undefined

    if (!env?.DB) {
      return NextResponse.json({ error: 'Database not available in development' }, { status: 503 })
    }

    let success = false
    switch (action) {
      case 'assign':
        if (!courtId || !matchId) {
          return NextResponse.json({ error: 'Missing courtId or matchId' }, { status: 400 })
        }
        success = await assignMatchToCourt(env.DB, matchId, courtId)
        break
      case 'clear':
        if (!courtId) {
          return NextResponse.json({ error: 'Missing courtId' }, { status: 400 })
        }
        success = await clearCourt(env.DB, courtId)
        break
      case 'updateStatus':
        if (!courtId || !status) {
          return NextResponse.json({ error: 'Missing courtId or status' }, { status: 400 })
        }
        success = await updateCourtStatus(env.DB, courtId, status)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in court management:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
