import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { assignMatchToCourt, clearCourt, updateCourtStatus } from '@/lib/court-management'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAdmin = token ? await verifyAdminToken(token) : false
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, courtId, matchId, status } = body

    // Court management operations are in-memory for now
    let success = false
    switch (action) {
      case 'assign':
        if (!courtId || !matchId) {
          return NextResponse.json({ error: 'Missing courtId or matchId' }, { status: 400 })
        }
        success = await assignMatchToCourt(undefined as any, matchId, courtId)
        break
      case 'clear':
        if (!courtId) {
          return NextResponse.json({ error: 'Missing courtId' }, { status: 400 })
        }
        success = await clearCourt(undefined as any, courtId)
        break
      case 'updateStatus':
        if (!courtId || !status) {
          return NextResponse.json({ error: 'Missing courtId or status' }, { status: 400 })
        }
        success = await updateCourtStatus(undefined as any, courtId, status)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!success) {
      console.error('[Court Management] Operation failed:', action, { courtId, matchId, status })
      return NextResponse.json(
        {
          error: 'Database operation failed',
          details: `Failed to ${action} court`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Court Management] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
