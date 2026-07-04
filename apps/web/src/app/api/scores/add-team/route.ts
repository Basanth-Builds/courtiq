import { cookies } from 'next/headers'
import { addTeamToPool } from '@/lib/store'
import { verifyAdminToken } from '@/lib/admin-auth'

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

  const success = addTeamToPool(poolId, teamName.trim())

  if (success) {
    return Response.json({ success: true })
  } else {
    return Response.json({ error: 'Pool not found' }, { status: 404 })
  }
}
