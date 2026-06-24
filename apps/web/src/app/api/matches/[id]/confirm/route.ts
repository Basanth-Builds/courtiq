import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { role } = body // 'umpire' | 'referee'
  // TODO: record ApprovalEvent, check if both confirmed, trigger DUPR job
  return NextResponse.json({ success: true, matchId: params.id, confirmedBy: role })
}
