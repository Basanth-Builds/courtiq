import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import * as SupabaseStore from '@/lib/supabase-store'
import {
  completeGame as completeGameInMemory,
  getMatchWithGames as getMatchWithGamesInMemory,
  updateGameScore as updateGameScoreInMemory,
} from '@/lib/store'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

interface RequestBody {
  gameId?: string
  matchId?: string
  team1Score?: number
  team2Score?: number
  complete?: boolean
  winner?: 'team1' | 'team2'
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('ciq_admin')?.value ?? ''
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: RequestBody

  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { gameId, matchId, team1Score, team2Score, complete, winner } = body

  if (!gameId) {
    return NextResponse.json({ error: 'gameId is required' }, { status: 400 })
  }

  const hasScoreUpdate = team1Score !== undefined || team2Score !== undefined

  if (hasScoreUpdate) {
    if (
      typeof team1Score !== 'number' ||
      typeof team2Score !== 'number' ||
      !Number.isInteger(team1Score) ||
      !Number.isInteger(team2Score) ||
      team1Score < 0 ||
      team2Score < 0
    ) {
      return NextResponse.json(
        { error: 'team1Score and team2Score must be non-negative integers' },
        { status: 400 }
      )
    }
  }

  if (complete && winner !== 'team1' && winner !== 'team2') {
    return NextResponse.json(
      { error: 'winner must be team1 or team2 when completing a game' },
      { status: 400 }
    )
  }

  try {
    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()

      if (hasScoreUpdate) {
        const success = await SupabaseStore.updateGameScore(
          supabase,
          gameId,
          team1Score!,
          team2Score!
        )
        if (!success) {
          console.error('[Update Game] Supabase score update failed for game', gameId)
          return NextResponse.json(
            {
              error: 'Database operation failed',
              details: 'Failed to update game score',
            },
            { status: 500 }
          )
        }
      }

      if (complete) {
        const success = await SupabaseStore.completeGame(supabase, gameId, winner!)
        if (!success) {
          console.error('[Update Game] Supabase game completion failed for game', gameId)
          return NextResponse.json(
            {
              error: 'Database operation failed',
              details: 'Failed to complete game',
            },
            { status: 500 }
          )
        }
      }

      // Get the updated match
      const match = matchId ? await SupabaseStore.getMatchWithGames(supabase, matchId) : null
      return NextResponse.json(
        { success: true, match },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Development: Use in-memory store
    if (hasScoreUpdate) {
      const success = updateGameScoreInMemory(gameId, team1Score!, team2Score!)
      if (!success) {
        return NextResponse.json({ error: 'Failed to update game score' }, { status: 500 })
      }
    }

    if (complete) {
      const success = completeGameInMemory(gameId, winner!)
      if (!success) {
        return NextResponse.json({ error: 'Failed to complete game' }, { status: 500 })
      }
    }

    const matchIdFromMemory = getMatchOwnerFromMemory(gameId)
    if (!matchIdFromMemory) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const match = getMatchWithGamesInMemory(matchIdFromMemory)
    return NextResponse.json({ success: true, match }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[Update Game] Error:', error)
    return NextResponse.json({ error: 'Failed to update game score' }, { status: 500 })
  }
}

function getMatchOwnerFromMemory(gameId: string): string | null {
  const matchId = gameId.replace(/-game-\d+$/, '')
  return getMatchWithGamesInMemory(matchId) ? matchId : null
}
