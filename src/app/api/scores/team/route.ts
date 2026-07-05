import { cookies } from 'next/headers'
import { updateTeamName } from '@/lib/store'
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

  const { matchId, team, newName } = await request.json()

  if (!matchId || !team || !newName || (team !== 'team1' && team !== 'team2')) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const { env, isProduction } = await getEnvironment()
    logEnvironment('Update Team Name', isProduction)
    
    let success: boolean

    if (isProduction && env?.DB) {
      success = await D1Store.updateTeamName(env.DB, matchId, team, newName)
      
      if (!success) {
        console.error('[Update Team Name] D1 write failed for match', matchId)
        return Response.json({ 
          error: 'Database update failed',
          details: 'D1 write operation returned false'
        }, { status: 500 })
      }
    } else {
      success = updateTeamName(matchId, team, newName)
      
      if (!success) {
        return Response.json({ error: 'Match not found' }, { status: 404 })
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Update Team Name] Error:', error)
    return Response.json({ error: 'Failed to update team name' }, { status: 500 })
  }
}
