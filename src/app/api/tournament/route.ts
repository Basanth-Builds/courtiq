export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

// GET tournament (for admin management)
export async function GET() {
  try {
    const supabase = await createServerSupabaseAdminClient()
    
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      tournament: tournaments?.[0] || null 
    }, { 
      headers: { 'Cache-Control': 'no-store' } 
    })
  } catch (error) {
    console.error('[GET Tournament] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch tournament' 
    }, { status: 500 })
  }
}

// POST create or update tournament
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, tournamentId, name, venue, date } = body
    
    const supabase = await createServerSupabaseAdminClient()
    
    if (action === 'create') {
      // Create new tournament with default categories
      const newTournamentId = `trn_${Date.now()}`
      
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .insert({
          id: newTournamentId,
          name: name || 'New Tournament',
          slug: `tournament-${Date.now()}`,
          venue: venue || '',
          date: date || new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        })
      
      if (tournamentError) throw tournamentError
      
      // Create default categories
      const defaultCategories = [
        { id: `cat_singles_${Date.now()}`, name: 'Open Singles', format: 'SINGLES' },
        { id: `cat_doubles_${Date.now() + 1}`, name: 'Open Doubles', format: 'DOUBLES' },
        { id: `cat_38_${Date.now() + 2}`, name: 'Open Doubles 3.8', format: 'DOUBLES' },
      ]
      
      const categoriesWithTournament = defaultCategories.map(cat => ({
        ...cat,
        tournament_id: newTournamentId,
      }))
      
      const { error: categoriesError } = await supabase
        .from('categories')
        .insert(categoriesWithTournament)
      
      if (categoriesError) throw categoriesError
      
      // Create default pools for each category
      const pools = []
      for (const cat of categoriesWithTournament) {
        pools.push({
          id: `pool_${cat.id}_a_${Date.now()}`,
          category_id: cat.id,
          tournament_id: newTournamentId,
          name: 'Pool A',
        })
        pools.push({
          id: `pool_${cat.id}_b_${Date.now() + 1}`,
          category_id: cat.id,
          tournament_id: newTournamentId,
          name: 'Pool B',
        })
      }
      
      const { error: poolsError } = await supabase
        .from('pools')
        .insert(pools)
      
      if (poolsError) throw poolsError
      
      return NextResponse.json({ 
        success: true, 
        tournamentId: newTournamentId,
        message: 'Tournament created successfully' 
      })
    }
    
    if (action === 'update') {
      if (!tournamentId) {
        return NextResponse.json({ 
          error: 'Tournament ID required' 
        }, { status: 400 })
      }
      
      const { error } = await supabase
        .from('tournaments')
        .update({
          name,
          venue,
          date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tournamentId)
      
      if (error) throw error
      
      return NextResponse.json({ 
        success: true,
        message: 'Tournament updated successfully' 
      })
    }
    
    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('[POST Tournament] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to manage tournament' 
    }, { status: 500 })
  }
}

// DELETE tournament (careful - cascades to all related data)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tournamentId = searchParams.get('id')
    
    if (!tournamentId) {
      return NextResponse.json({ 
        error: 'Tournament ID required' 
      }, { status: 400 })
    }
    
    const supabase = await createServerSupabaseAdminClient()
    
    // Delete tournament (cascades to categories, pools, matches, games)
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true,
      message: 'Tournament deleted successfully' 
    })
    
  } catch (error) {
    console.error('[DELETE Tournament] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete tournament' 
    }, { status: 500 })
  }
}
