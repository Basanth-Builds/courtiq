export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

/**
 * Initialize tournament with test data
 * This creates a tournament with categories, pools, and sample matches
 * Use POST to create, GET to check status
 */

export async function GET() {
  try {
    const supabase = await createServerSupabaseAdminClient()
    
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('id, name, categories(id, name, pools(id, name, matches:matches(count)))')
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({
      initialized: tournaments && tournaments.length > 0,
      tournament: tournaments?.[0] || null,
    })
  } catch (error) {
    console.error('[GET Init] Error:', error)
    return NextResponse.json({ error: 'Failed to check initialization' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseAdminClient()
    
    // Check if already initialized
    const { data: existing } = await supabase
      .from('tournaments')
      .select('id')
      .limit(1)
    
    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Already initialized',
        tournamentId: existing[0].id,
      })
    }
    
    const tournamentId = 'trn_demo'
    
    // Create tournament
    const { error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        id: tournamentId,
        name: 'Court IQ Tournament 2026',
        slug: 'court-iq-2026',
        venue: 'Pickleball Central',
        date: '2026-07-15',
        status: 'ACTIVE',
      })
    
    if (tournamentError) {
      console.error('Tournament creation error:', tournamentError)
      throw tournamentError
    }
    
    // Create categories
    const categories = [
      { id: 'cat_open_singles', name: 'Open Singles', format: 'SINGLES' },
      { id: 'cat_open_doubles', name: 'Open Doubles', format: 'DOUBLES' },
      { id: 'cat_38_doubles', name: 'Open Doubles 3.8', format: 'DOUBLES' },
    ]
    
    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(
        categories.map(cat => ({
          ...cat,
          tournament_id: tournamentId,
        }))
      )
    
    if (categoriesError) {
      console.error('Categories creation error:', categoriesError)
      throw categoriesError
    }
    
    // Create pools
    const pools = [
      // Singles pools
      { id: 'pool_singles_a', category_id: 'cat_open_singles', name: 'Pool A' },
      { id: 'pool_singles_b', category_id: 'cat_open_singles', name: 'Pool B' },
      // Doubles pools
      { id: 'pool_doubles_a', category_id: 'cat_open_doubles', name: 'Pool A' },
      { id: 'pool_doubles_b', category_id: 'cat_open_doubles', name: 'Pool B' },
      // 3.8 Doubles pools
      { id: 'pool_38_a', category_id: 'cat_38_doubles', name: 'Pool A' },
      { id: 'pool_38_b', category_id: 'cat_38_doubles', name: 'Pool B' },
    ]
    
    const { error: poolsError } = await supabase
      .from('pools')
      .insert(
        pools.map(pool => ({
          ...pool,
          tournament_id: tournamentId,
        }))
      )
    
    if (poolsError) {
      console.error('Pools creation error:', poolsError)
      throw poolsError
    }
    
    // Create sample matches
    const matches = [
      // Singles Pool A
      {
        id: 'match_singles_1',
        tournament_id: tournamentId,
        category_id: 'cat_open_singles',
        pool_id: 'pool_singles_a',
        team1: 'Alex Martinez',
        team2: 'Jordan Lee',
        stage: 'POOL',
        status: 'CONFIRMED',
        team1_score: 11,
        team2_score: 9,
        court_number: 1,
      },
      {
        id: 'match_singles_2',
        tournament_id: tournamentId,
        category_id: 'cat_open_singles',
        pool_id: 'pool_singles_a',
        team1: 'Sam Rivera',
        team2: 'Taylor Kim',
        stage: 'POOL',
        status: 'IN_PROGRESS',
        team1_score: 7,
        team2_score: 5,
        court_number: 2,
      },
      // Doubles Pool A
      {
        id: 'match_doubles_1',
        tournament_id: tournamentId,
        category_id: 'cat_open_doubles',
        pool_id: 'pool_doubles_a',
        team1: 'Team Alpha',
        team2: 'Team Bravo',
        stage: 'POOL',
        status: 'SCHEDULED',
        team1_score: null,
        team2_score: null,
        court_number: 3,
      },
      // 3.8 Doubles Pool A
      {
        id: 'match_38_1',
        tournament_id: tournamentId,
        category_id: 'cat_38_doubles',
        pool_id: 'pool_38_a',
        team1: 'Pro Team 1',
        team2: 'Pro Team 2',
        stage: 'POOL',
        status: 'CONFIRMED',
        team1_score: 11,
        team2_score: 8,
        court_number: 4,
      },
    ]
    
    const { error: matchesError } = await supabase
      .from('matches')
      .insert(matches)
    
    if (matchesError) {
      console.error('Matches creation error:', matchesError)
      throw matchesError
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tournament initialized successfully',
      tournamentId,
      stats: {
        categories: categories.length,
        pools: pools.length,
        matches: matches.length,
      },
    })
    
  } catch (error) {
    console.error('[POST Init] Error:', error)
    return NextResponse.json({
      error: 'Failed to initialize tournament',
      details: String(error),
    }, { status: 500 })
  }
}
