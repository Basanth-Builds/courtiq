import { NextRequest, NextResponse } from 'next/server'
import { updateMatch } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { verifyAdminToken } from '@/lib/admin-auth'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'

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

  try {
    const { env, isProduction } = getEnvironment(req)
    logEnvironment('Update Match', isProduction)

    let success: boolean

    if (isProduction && env?.DB) {
      // Production: Use D1 database
      success = await D1Store.updateMatch(env.DB, matchId, updates)
      
      if (!success) {
        console.error('[Update Match] D1 write failed for match', matchId)
        return NextResponse.json({ 
          error: 'Database update failed',
          details: 'D1 write operation returned false'
        }, { status: 500 })
      }
    } else {
      // Development: Use in-memory store
      success = updateMatch(matchId, updates)
      
      if (!success) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[Update Match] Error:', error)
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
}
