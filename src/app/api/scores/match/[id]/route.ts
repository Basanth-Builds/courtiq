import { NextResponse } from 'next/server'
import * as D1Store from '@/lib/d1-store'
import { getMatchWithGames as getMatchWithGamesInMemory, deleteMatch as deleteMatchInMemory } from '@/lib/store'
import { getMatchWithGames as getMatchWithGamesFromD1 } from '@/lib/d1-store-enhanced'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'
import { cookies } from 'next/headers'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { env, isProduction } = await getEnvironment()

    const match = isProduction && env?.DB
      ? await getMatchWithGamesFromD1(env.DB, id)
      : getMatchWithGamesInMemory(id)

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
    const { env, isProduction } = await getEnvironment()
    logEnvironment('DELETE Match', isProduction)

    let success: boolean

    if (isProduction && env?.DB) {
      success = await D1Store.deleteMatch(env.DB, matchId)

      if (!success) {
        console.error(`[DELETE Match] D1 delete failed for match ${matchId}`)
        return NextResponse.json({
          error: 'Database delete failed',
          details: 'Check server logs for D1 error'
        }, { status: 500 })
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
