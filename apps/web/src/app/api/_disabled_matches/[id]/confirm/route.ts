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
  const { action, duprEligible, duprExclusionReason, note } = body
  // action: 'approve' | 'reject'

  if (action === 'approve') {
    const match = await matchRepository.refereeApprove({
      matchId,
      refereeId: session.user.id as string,
      duprEligible: Boolean(duprEligible),
      duprExclusionReason,
      note,
    })
    return NextResponse.json({ success: true, match })
  }

  if (action === 'reject') {
    if (!note) {
      return NextResponse.json({ error: 'note is required for rejection' }, { status: 400 })
    }
    const match = await matchRepository.refereeReject({
      matchId,
      refereeId: session.user.id as string,
      note,
    })
    return NextResponse.json({ success: true, match })
  }

  return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
}
