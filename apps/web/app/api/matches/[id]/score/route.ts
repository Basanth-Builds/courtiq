import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const scoreSchema = z.object({
  team1Score: z.number().min(0).max(21),
  team2Score: z.number().min(0).max(21),
  status: z.enum(['in_progress', 'provisional', 'confirmed']),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const score = scoreSchema.parse(body)

  // TODO: save via @court-iq/db, emit socket event
  return NextResponse.json({ matchId: params.id, ...score })
}
