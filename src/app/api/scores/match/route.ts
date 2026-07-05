import { NextRequest, NextResponse } from 'next/server'
import { updateMatch } from '@/lib/store'
import * as SupabaseStore from '@/lib/supabase-store'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

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
    let success: boolean

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()
      
      if (updates.score) {
        success = await SupabaseStore.updateMatch(
          supabase,
          matchId,
          updates.score.team1,
          updates.score.team2
        )
      } else {
        success = true
      }

      if (!success) {
        console.error('[Update Match] Supabase write failed for match', matchId)
        return NextResponse.json(
          {
            error: 'Database update failed',
            details: 'Supabase write operation returned false',
          },
          { status: 500 }
        )
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
