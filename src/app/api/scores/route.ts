export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getTournamentStore } from '@/lib/store'
import * as SupabaseStore from '@/lib/supabase-store'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

// GET all tournament data - PUBLIC (no auth needed)
export async function GET() {
  try {
    const supabase = await createServerSupabaseAdminClient()
    
    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const tournaments = await SupabaseStore.getTournamentData(supabase)
      return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Fallback to in-memory store (development without Supabase)
    const tournaments = getTournamentStore()
    return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[GET Scores] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: 500 })
  }
}
