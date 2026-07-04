import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { matchRepository } from '@court-iq/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: matchId } = await params
  const body = await req.json()
  const { team1Points, team2Points, isComplete } = body

  if (typeof team1Points !== 'number' || typeof team2Points !== 'number') {
    return NextResponse.json({ error: 'team1Points and team2Points are required numbers' }, { status: 400 })
  }

  const result = await matchRepository.submitScore({
    matchId,
    team1Points,
    team2Points,
    isComplete: Boolean(isComplete),
    umpireId: session.user.id as string,
  })

  return NextResponse.json({ success: true, match: result.match, score: result.score })
}
