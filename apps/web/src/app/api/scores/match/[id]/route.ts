import { NextResponse } from 'next/server'
import * as D1Store from '@/lib/d1-store'
import { getMatchWithGames as getMatchWithGamesInMemory } from '@/lib/store'
import { getMatchWithGames as getMatchWithGamesFromD1 } from '@/lib/d1-store-enhanced'

interface Env {
  DB?: D1Store.D1Database
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const env = (request as any).cloudflare?.env as Env | undefined

    const match = env?.DB
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
