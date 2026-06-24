'use client'

import { CourtDeskView } from '@/components/court-desk/court-desk-view'

interface Props {
  params: { matchId: string }
}

export default function CourtDeskPage({ params }: Props) {
  return <CourtDeskView matchId={params.matchId} />
}
