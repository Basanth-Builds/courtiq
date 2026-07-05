import { NextResponse } from 'next/server'
import { getCourtBoard } from '@/lib/court-management'
import { getEnvironment } from '@/lib/cloudflare-env'

export async function GET() {
  try {
    const { env, isProduction } = await getEnvironment()

    if (isProduction && env?.DB) {
      const tournamentId = 'trn_demo'
      const courtBoard = await getCourtBoard(env.DB, tournamentId)
      return NextResponse.json({ courtBoard })
    }

    // Mock data for development
    return NextResponse.json({
      courtBoard: [
        { court: { id: 'court_1', tournamentId: 'trn_demo', courtNumber: 1, name: 'Court 1', status: 'AVAILABLE', currentMatchId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentMatch: null },
        { court: { id: 'court_2', tournamentId: 'trn_demo', courtNumber: 2, name: 'Court 2', status: 'AVAILABLE', currentMatchId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentMatch: null },
        { court: { id: 'court_3', tournamentId: 'trn_demo', courtNumber: 3, name: 'Court 3', status: 'AVAILABLE', currentMatchId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentMatch: null },
        { court: { id: 'court_4', tournamentId: 'trn_demo', courtNumber: 4, name: 'Court 4', status: 'AVAILABLE', currentMatchId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, currentMatch: null },
      ],
    })
  } catch (error) {
    console.error('Error fetching court board:', error)
    return NextResponse.json({ error: 'Failed to fetch court board' }, { status: 500 })
  }
}
