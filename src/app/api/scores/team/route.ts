import { cookies } from 'next/headers'
import { updateTeamName } from '@/lib/store'
import * as D1Store from '@/lib/d1-store'
import { verifyAdminToken } from '@/lib/admin-auth'


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

  const { matchId, team, newName } = await request.json()

  if (!matchId || !team || !newName || (team !== 'team1' && team !== 'team2')) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const env = (request as any).cloudflare?.env as Env | undefined
    let success

    if (env?.DB) {
      success = await D1Store.updateTeamName(env.DB, matchId, team, newName)
    } else {
      success = updateTeamName(matchId, team, newName)
    }

    if (success) {
      return Response.json({ success: true })
    } else {
      return Response.json({ error: 'Match not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating team name:', error)
    return Response.json({ error: 'Failed to update team name' }, { status: 500 })
  }
}
