import { NextResponse } from 'next/server'
import * as SupabaseStore from '@/lib/supabase-store'
import { getMatchWithGames as getMatchWithGamesInMemory, deleteMatch as deleteMatchInMemory } from '@/lib/store'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    let match

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()
      match = await SupabaseStore.getMatchWithGames(supabase, id)
    } else {
      match = getMatchWithGamesInMemory(id)
    }

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({ match }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching match with games:', error)
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('ciq_admin')

    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: matchId } = await params

    let success: boolean

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()
      success = await SupabaseStore.deleteMatch(supabase, matchId)

      if (!success) {
        console.error(`[DELETE Match] Supabase delete failed for match ${matchId}`)
        return NextResponse.json(
          {
            error: 'Database delete failed',
            details: 'Check server logs for Supabase error',
          },
          { status: 500 }
        )
      }
    } else {
      success = deleteMatchInMemory(matchId)

      if (!success) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }
    }

    console.log(`[DELETE Match] Successfully deleted match ${matchId}`)
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[DELETE Match] Error:', error)
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
}
