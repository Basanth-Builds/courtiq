import { cookies } from 'next/headers'
import { addTeamToPool } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { verifyAdminToken } from '@/lib/admin-auth'

export const runtime = 'edge'

interface Env {
  DB?: D1Store.D1Database
}

export async function POST(request: Request) {
  // Verify admin authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('ciq_admin')
  if (!token || !verifyAdminToken(token.value)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { poolId, teamName } = await request.json()

  if (!poolId || !teamName || typeof teamName !== 'string' || teamName.trim() === '') {
    return Response.json({ error: 'Invalid request: poolId and teamName required' }, { status: 400 })
  }

  try {
    const env = (request as any).env as Env | undefined
    let success

    if (env?.DB) {
      success = await D1Store.addTeamToPool(env.DB, poolId, teamName.trim())
    } else {
      success = addTeamToPool(poolId, teamName.trim())
    }

    if (success) {
      return Response.json({ success: true })
    } else {
      return Response.json({ error: 'Pool not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error adding team:', error)
    return Response.json({ error: 'Failed to add team' }, { status: 500 })
  }
}
