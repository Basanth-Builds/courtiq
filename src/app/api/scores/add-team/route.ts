import { cookies } from 'next/headers'
import { addTeamToPool } from '@/lib/store'
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

  const { poolId, categoryId, tournamentId, teamName } = await request.json()

  if (!poolId || !teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'Invalid request: poolId and teamName required' }, { status: 400 })
  }

  try {
    let success: boolean

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()
      
      const matchId = await SupabaseStore.addTeamToPool(
        supabase,
        poolId,
        categoryId,
        tournamentId,
        teamName.trim()
      )

      if (!matchId) {
        console.error('[Add Team] Supabase write failed for pool', poolId)
        return Response.json(
          {
            error: 'Database operation failed',
            details: 'Supabase write operation returned null',
          },
          { status: 500 }
        )
      }
    } else {
      success = addTeamToPool(poolId, teamName.trim())

      if (!success) {
        return Response.json({ error: 'Pool not found' }, { status: 404 })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Add Team] Error:', error)
    return Response.json({ error: 'Failed to add team' }, { status: 500 })
  }
}
