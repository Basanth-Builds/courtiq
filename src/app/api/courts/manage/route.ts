import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { assignMatchToCourt, clearCourt, updateCourtStatus } from '@/lib/court-management'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAdmin = token ? await verifyAdminToken(token) : false
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, courtId, matchId, status } = body
    
    const { env, isProduction } = await getEnvironment()
    logEnvironment('Court Management', isProduction)

    if (!isProduction || !env?.DB) {
      return NextResponse.json({ 
        error: 'Court management is only available in production' 
      }, { status: 503 })
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
      console.error('[Court Management] Operation failed:', action, { courtId, matchId, status })
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: `Failed to ${action} court`
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Court Management] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
