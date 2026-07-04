export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as Store from '@/lib/store'
import * as D1Store from '@/lib/d1-store'

interface Env {
  DB?: D1Store.D1Database
}

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
    const authToken = cookieStore.get('admin_auth')

    if (!authToken || authToken.value !== 'true') {
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

    // Get environment for D1 database
    const env = (request as any).cloudflare?.env as Env | undefined

    let newMatch

    if (env?.DB) {
      // Production: Use D1 database
      newMatch = await D1Store.createMatch(env.DB, poolId, {
        team1: team1.trim(),
        team2: team2.trim(),
        courtNumber,
        status: status || 'SCHEDULED',
      })
    } else {
      // Development: Use in-memory store
      newMatch = Store.createMatch(poolId, {
        team1: team1.trim(),
        team2: team2.trim(),
        courtNumber,
        status: status || 'SCHEDULED',
      })
    }

    if (!newMatch) {
      return NextResponse.json(
        { error: 'Failed to create match. Pool may not exist.' },
        { status: 404 }
      )
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
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create match' },
      { status: 500 }
    )
  }
}
