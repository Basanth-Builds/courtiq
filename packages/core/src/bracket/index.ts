export type BracketSize = 4 | 8 | 16 | 32

export interface BracketSlot {
  id: string
  round: number
  position: number
  teamAId?: string
  teamBId?: string
  winnerId?: string
  phase: 'quarterfinal' | 'semifinal' | 'final' | 'third_place'
}

/**
 * Generates a single-elimination bracket from a list of advancing team IDs.
 * Teams are placed using standard bracket seeding (1 vs last seed, etc.)
 */
export function generateBracket(advancingTeamIds: string[]): BracketSlot[] {
  const n = advancingTeamIds.length
  const slots: BracketSlot[] = []

  if (n === 4) {
    slots.push(
      { id: 'qf1', round: 1, position: 1, teamAId: advancingTeamIds[0], teamBId: advancingTeamIds[3], phase: 'quarterfinal' },
      { id: 'qf2', round: 1, position: 2, teamAId: advancingTeamIds[1], teamBId: advancingTeamIds[2], phase: 'quarterfinal' },
      { id: 'sf1', round: 2, position: 1, phase: 'semifinal' },
      { id: 'sf2', round: 2, position: 2, phase: 'semifinal' },
      { id: 'f1', round: 3, position: 1, phase: 'final' },
      { id: '3p', round: 3, position: 2, phase: 'third_place' },
    )
  }

  if (n === 8) {
    const order = [0, 7, 3, 4, 1, 6, 2, 5]
    const ordered = order.map(i => advancingTeamIds[i]!)
    for (let i = 0; i < 4; i++) {
      slots.push({
        id: `qf${i + 1}`,
        round: 1,
        position: i + 1,
        teamAId: ordered[i * 2],
        teamBId: ordered[i * 2 + 1],
        phase: 'quarterfinal',
      })
    }
    slots.push(
      { id: 'sf1', round: 2, position: 1, phase: 'semifinal' },
      { id: 'sf2', round: 2, position: 2, phase: 'semifinal' },
      { id: 'f1', round: 3, position: 1, phase: 'final' },
      { id: '3p', round: 3, position: 2, phase: 'third_place' },
    )
  }

  return slots
}
