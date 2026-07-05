import { cookies } from 'next/headers'
import { addTeamToPool } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { verifyAdminToken } from '@/lib/admin-auth'
import { getEnvironment, logEnvironment } from '@/lib/cloudflare-env'

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
    const { env, isProduction } = getEnvironment(request)
    logEnvironment('Add Team', isProduction)
    
    let success: boolean

    if (isProduction && env?.DB) {
      success = await D1Store.addTeamToPool(env.DB, poolId, teamName.trim())
      
      if (!success) {
        console.error('[Add Team] D1 write failed for pool', poolId)
        return Response.json({ 
          error: 'Database operation failed',
          details: 'D1 write operation returned false'
        }, { status: 500 })
      }
    } else {
      success = addTeamToPool(poolId, teamName.trim())
      
      if (!success) {
        return Response.json({ error: 'Pool not found' }, { status: 404 })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Add Team] Error:', error)
    return Response.json({ error: 'Failed to add team' }, { status: 500 })
  }
}
