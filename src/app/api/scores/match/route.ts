import { NextRequest, NextResponse } from 'next/server'
import { updateMatch } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { verifyAdminToken } from '@/lib/admin-auth'


// Type for the environment bindings
interface Env {
  DB?: D1Store.D1Database
}

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
    // Get the environment (only available in Cloudflare Workers/Pages)
    const env = (req as any).cloudflare?.env as Env | undefined
    console.log('[Update Match] D1 database present?', Boolean(env?.DB))

    let success

    if (env?.DB) {
      // Production: Use D1 database
      success = await D1Store.updateMatch(env.DB, matchId, updates)
    } else {
      // Development: Use in-memory store
      success = updateMatch(matchId, updates)
    }

    if (!success) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
}
