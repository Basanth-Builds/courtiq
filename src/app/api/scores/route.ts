export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getTournamentStore } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'

// GET all tournament data - PUBLIC (no auth needed)
export async function GET() {
  try {
    const { env, isProduction } = await getEnvironment()
    logEnvironment('GET Scores', isProduction)

    let tournaments

    if (isProduction && env?.DB) {
      // Production: Use D1 database
      tournaments = await D1Store.getTournamentData(env.DB)
    } else {
      // Development: Use in-memory store
      tournaments = getTournamentStore()
    }

    return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[GET Scores] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: 500 })
  }
}
