import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import type { D1Database } from '@/lib/d1-store'

interface Env {
  DB?: D1Database
}

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

    const env = (req as any).cloudflare?.env as Env | undefined

    if (env?.DB) {
      // Use D1 in production
      const poolId = `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      await env.DB
        .prepare('INSERT INTO pools (id, category_id, name) VALUES (?, ?, ?)')
        .bind(poolId, categoryId, poolName)
        .run()

      return NextResponse.json({
        success: true,
        pool: { id: poolId, categoryId, name: poolName }
      })
    }

    // In-memory store for development
    const { getTournamentStore } = await import('@/lib/store')
    const store = getTournamentStore()

    // Find the category
    for (const tournament of store) {
      const category = tournament.categories.find(c => c.id === categoryId)
      if (category) {
        const newPool = {
          id: `pool_${Date.now()}`,
          categoryId: category.id,
          name: poolName,
          matches: []
        }
        category.pools.push(newPool)

        return NextResponse.json({
          success: true,
          pool: newPool
        })
      }
    }

    return NextResponse.json({ error: 'Category not found' }, { status: 404 })

  } catch (error) {
    console.error('Error adding pool:', error)
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

    const env = (req as any).cloudflare?.env as Env | undefined

    if (env?.DB) {
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
      await env.DB
        .prepare('DELETE FROM pools WHERE id = ?')
        .bind(poolId)
        .run()

      return NextResponse.json({ success: true })
    }

    // In-memory store for development
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
    console.error('Error deleting pool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
