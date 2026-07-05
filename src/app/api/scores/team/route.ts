import { cookies } from 'next/headers'
import { updateTeamName } from '@/lib/store'
import * as SupabaseStore from '@/lib/supabase-store'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Verify admin authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('ciq_admin')
  if (!token || !verifyAdminToken(token.value)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { matchId, team, newName } = await request.json()

  if (!matchId || !team || !newName || (team !== 'team1' && team !== 'team2')) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    let success: boolean

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()
      const teamNumber = team === 'team1' ? 1 : 2

      success = await SupabaseStore.updateTeamName(supabase, matchId, teamNumber, newName)

      if (!success) {
        console.error('[Update Team Name] Supabase write failed for match', matchId)
        return Response.json(
          {
            error: 'Database update failed',
            details: 'Supabase write operation returned false',
          },
          { status: 500 }
        )
      }
    } else {
      success = updateTeamName(matchId, team, newName)

      if (!success) {
        return Response.json({ error: 'Match not found' }, { status: 404 })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Update Team Name] Error:', error)
    return Response.json({ error: 'Failed to update team name' }, { status: 500 })
  }
}
