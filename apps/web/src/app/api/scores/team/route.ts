import { cookies } from 'next/headers'
import { updateTeamName } from '@/lib/store'
import { verifyAdminToken } from '@/lib/admin-auth'

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

  const success = updateTeamName(matchId, team, newName)

  if (success) {
    return Response.json({ success: true })
  } else {
    return Response.json({ error: 'Match not found' }, { status: 404 })
  }
}
