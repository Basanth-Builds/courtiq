export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { getTournamentStore } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'


// Type for the environment bindings
interface Env {
  DB?: D1Store.D1Database
}

// GET all tournament data - PUBLIC (no auth needed)
export async function GET(request: Request) {
  try {
    // Get the environment (only available in Cloudflare Workers/Pages)
    const env = (request as any).cloudflare?.env as Env | undefined
    console.log('[GET Scores] D1 database present?', Boolean(env?.DB))

    let tournaments

    if (env?.DB) {
      // Production: Use D1 database
      tournaments = await D1Store.getTournamentData(env.DB)
    } else {
      // Development: Use in-memory store
      tournaments = getTournamentStore()
    }

    return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching tournament data:', error)
    return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: 500 })
  }
}
