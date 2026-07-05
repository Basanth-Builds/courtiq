import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'
import * as D1Store from '@/lib/d1-store'
import { addPool } from '@/lib/store'

// Create a new pool
export async function POST(req: NextRequest) {
  // Verify admin authentication
  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? ''
  const isValid = await verifyAdminToken(token)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { categoryId, poolName } = body

    if (!categoryId || !poolName) {
      return NextResponse.json({ error: 'Missing categoryId or poolName' }, { status: 400 })
    }

    const { env, isProduction } = getEnvironment(req)
    logEnvironment('Create Pool', isProduction)

    if (isProduction && env?.DB) {
      // Production: Use D1 database
      const pool = await D1Store.addPool(env.DB, categoryId, poolName)
      
      if (!pool) {
        console.error('[Create Pool] D1 operation failed for category', categoryId)
        return NextResponse.json({ 
          error: 'Database operation failed',
          details: 'Category may not exist'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        pool: pool
      })
    }

    // Development: Use in-memory store
    const pool = addPool(categoryId, poolName)
    
    if (!pool) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      pool: pool
    })

  } catch (error) {
    console.error('[Create Pool] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a pool
export async function DELETE(req: NextRequest) {
  // Verify admin authentication
  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? ''
  const isValid = await verifyAdminToken(token)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const poolId = searchParams.get('poolId')

    if (!poolId) {
      return NextResponse.json({ error: 'Missing poolId' }, { status: 400 })
    }

    const { env, isProduction } = getEnvironment(req)
    logEnvironment('Delete Pool', isProduction)

    if (isProduction && env?.DB) {
      // Check if pool has matches
      const matches = await env.DB
        .prepare('SELECT COUNT(*) as count FROM matches WHERE pool_id = ?')
        .bind(poolId)
        .first<{ count: number }>()

      if (matches && matches.count > 0) {
        return NextResponse.json({
          error: 'Cannot delete pool with existing matches'
        }, { status: 400 })
      }

      // Delete the pool
      const result = await env.DB
        .prepare('DELETE FROM pools WHERE id = ?')
        .bind(poolId)
        .run()
        
      if (!result.success) {
        console.error('[Delete Pool] D1 delete failed for pool', poolId)
        return NextResponse.json({ 
          error: 'Database operation failed'
        }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Development: Use in-memory store
    const { getTournamentStore } = await import('@/lib/store')
    const store = getTournamentStore()

    for (const tournament of store) {
      for (const category of tournament.categories) {
        const poolIndex = category.pools.findIndex(p => p.id === poolId)
        if (poolIndex !== -1) {
          if (category.pools[poolIndex].matches.length > 0) {
            return NextResponse.json({
              error: 'Cannot delete pool with existing matches'
            }, { status: 400 })
          }
          category.pools.splice(poolIndex, 1)
          return NextResponse.json({ success: true })
        }
      }
    }

    return NextResponse.json({ error: 'Pool not found' }, { status: 404 })

  } catch (error) {
    console.error('[Delete Pool] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
