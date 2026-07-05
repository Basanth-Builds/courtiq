import { NextRequest, NextResponse } from 'next/server'
import { updatePool } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { verifyAdminToken } from '@/lib/admin-auth'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'

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
    const { env, isProduction } = getEnvironment(req)
    logEnvironment('Pool Update', isProduction)
    
    let success: boolean

    if (isProduction && env?.DB) {
      success = await D1Store.updatePool(env.DB, poolId, updates)
      
      if (!success) {
        console.error('[Pool Update] D1 write failed for pool', poolId)
        return NextResponse.json({ 
          error: 'Database update failed',
          details: 'D1 write operation returned false'
        }, { status: 500 })
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
