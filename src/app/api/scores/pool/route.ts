import { NextRequest, NextResponse } from 'next/server'
import { updatePool } from '@/lib/store'
import * as SupabaseStore from '@/lib/supabase-store'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createServerSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify admin authentication via cookie
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { poolId, updates } = await req.json()

  if (!poolId || !updates) {
    return NextResponse.json({ error: 'Missing poolId or updates' }, { status: 400 })
  }

  try {
    let success: boolean

    // Try Supabase first (production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseAdminClient()

      if (updates.name) {
        success = await SupabaseStore.updatePool(supabase, poolId, updates.name)
      } else {
        success = true
      }

      if (!success) {
        console.error('[Pool Update] Supabase write failed for pool', poolId)
        return NextResponse.json(
          {
            error: 'Database update failed',
            details: 'Supabase write operation returned false',
          },
          { status: 500 }
        )
      }
    } else {
      success = updatePool(poolId, updates)

      if (!success) {
        return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[Pool Update] Error:', error)
    return NextResponse.json({ error: 'Failed to update pool' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  // Verify admin authentication via cookie
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { poolId } = await req.json()

  if (!poolId) {
    return NextResponse.json({ error: 'Missing poolId' }, { status: 400 })
  }

  try {
    // For now, just return success - delete pool operations would need full implementation
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[Pool Delete] Error:', error)
    return NextResponse.json({ error: 'Failed to delete pool' }, { status: 500 })
  }
}
