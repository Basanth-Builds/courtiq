export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as Store from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'

/**
 * POST /api/scores/match/create
 * Create a new match in a pool
 * 
 * Request body:
 * {
 *   poolId: string
 *   team1: string
 *   team2: string
 *   courtNumber?: number
 *   status?: 'SCHEDULED' | 'IN_PROGRESS' | 'CONFIRMED'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const authToken = cookieStore.get('ciq_admin')

    if (!authToken || !authToken.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { poolId, team1, team2, courtNumber, status } = body

    // Validate required fields
    if (!poolId || !team1 || !team2) {
      return NextResponse.json(
        { error: 'Missing required fields: poolId, team1, team2' },
        { status: 400 }
      )
    }

    // Validate team names are different
    if (team1.trim() === team2.trim()) {
      return NextResponse.json(
        { error: 'Team names must be different' },
        { status: 400 }
      )
    }

    // Get environment
    const { env, isProduction } = await getEnvironment()
    logEnvironment('Create Match', isProduction)

    let newMatch

    if (isProduction && env?.DB) {
      // Production: Use D1 database
      newMatch = await D1Store.createMatch(env.DB, poolId, {
        team1: team1.trim(),
        team2: team2.trim(),
        courtNumber,
        status: status || 'SCHEDULED',
      })
      
      if (!newMatch) {
        console.error('[Create Match] D1 operation failed for pool', poolId)
        return NextResponse.json(
          { error: 'Database operation failed. Pool may not exist.' },
          { status: 500 }
        )
      }
    } else {
      // Development: Use in-memory store
      newMatch = Store.createMatch(poolId, {
        team1: team1.trim(),
        team2: team2.trim(),
        courtNumber,
        status: status || 'SCHEDULED',
      })
      
      if (!newMatch) {
        return NextResponse.json(
          { error: 'Failed to create match. Pool may not exist.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        match: newMatch,
        message: 'Match created successfully',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error: any) {
    console.error('[Create Match] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create match' },
      { status: 500 }
    )
  }
}
