import { CourtDeskView } from '@/components/court-desk/court-desk-view'

export const metadata = { title: 'Court Desk' }

export default function CourtDeskPage({ params }: { params: { matchId: string } }) {
  return <CourtDeskView matchId={params.matchId} />
}
