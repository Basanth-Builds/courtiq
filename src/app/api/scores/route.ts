export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { getTournamentStore } from '@/lib/store'
import * as SupabaseStore from '@/lib/supabase-store'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

// GET all tournament data - PUBLIC (no auth needed)
export async function GET() {
  try {
    // Diagnostic logging
    console.log('[GET Scores] Env vars present:', {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('[GET Scores] Using Supabase...')
      console.log('[GET Scores] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('[GET Scores] Service key present (length):', process.env.SUPABASE_SERVICE_ROLE_KEY.length)
      
      const supabase = await createServerSupabaseAdminClient()
      
      // Test basic connection with simpler query
      const { data: testData, error: testError } = await supabase
        .from('tournaments')
        .select('id', { count: 'exact', head: true })
      
      if (testError) {
        console.error('[GET Scores] Supabase connection test failed:', {
          message: testError.message,
          code: testError.code,
          details: testError.details,
          hint: testError.hint,
          status: (testError as any).status,
          toString: testError.toString(),
        })
        throw new Error(`Supabase error: ${testError.message || testError.toString() || JSON.stringify(testError)}`)
      }
      
      console.log('[GET Scores] Supabase connection OK, fetching data...')
      const tournaments = await SupabaseStore.getTournamentData(supabase)
      console.log('[GET Scores] Fetched tournaments:', tournaments.length)
      return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Fallback to in-memory store (development without Supabase)
    console.log('[GET Scores] Using in-memory store (Supabase not configured)')
    const tournaments = getTournamentStore()
    return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[GET Scores] CRITICAL ERROR:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch tournament data',
      debug: String(error)
    }, { status: 500 })
  }
}
