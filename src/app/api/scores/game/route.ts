import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import * as D1Store from '@/lib/d1-store'
import * as D1EnhancedStore from '@/lib/d1-store-enhanced'
import {
  completeGame as completeGameInMemory,
  getMatchWithGames as getMatchWithGamesInMemory,
  updateGameScore as updateGameScoreInMemory,
} from '@/lib/store'

interface Env {
  DB?: D1Store.D1Database
}

interface RequestBody {
  gameId?: string
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

  const { gameId, team1Score, team2Score, complete, winner } = body

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
    const env = (request as any).cloudflare?.env as Env | undefined

    if (env?.DB) {
      const game = await env.DB.prepare('SELECT match_id FROM games WHERE id = ?')
        .bind(gameId)
        .first<{ match_id: string }>()

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      if (hasScoreUpdate) {
        const success = await D1EnhancedStore.updateGameScore(
          env.DB,
          gameId,
          team1Score!,
          team2Score!
        )
        if (!success) {
          return NextResponse.json({ error: 'Failed to update game score' }, { status: 500 })
        }
      }

      if (complete) {
        const success = await D1EnhancedStore.completeGame(env.DB, gameId, winner!)
        if (!success) {
          return NextResponse.json({ error: 'Failed to complete game' }, { status: 500 })
        }
      }

      const match = await D1EnhancedStore.getMatchWithGames(env.DB, game.match_id)
      return NextResponse.json(
        { success: true, match },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const existingMatch = getMatchWithGamesInMemory(gameId.replace(/-game-\d+$/, ''))
    if (!existingMatch) {
      const directGameOwner = getMatchOwnerFromMemory(gameId)
      if (!directGameOwner) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }
    }

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

    const matchId = getMatchOwnerFromMemory(gameId)
    if (!matchId) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const match = getMatchWithGamesInMemory(matchId)
    return NextResponse.json({ success: true, match }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error updating game score:', error)
    return NextResponse.json({ error: 'Failed to update game score' }, { status: 500 })
  }
}

function getMatchOwnerFromMemory(gameId: string): string | null {
  const matchId = gameId.replace(/-game-\d+$/, '')
  return getMatchWithGamesInMemory(matchId) ? matchId : null
}
