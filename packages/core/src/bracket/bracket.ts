// ============================================================
// Court IQ — Bracket / Playoff Engine
// Supports 4, 8, 16 draw sizes
// Generates QF → SF → F + 3rd Place
// ============================================================

import type { Team, Match, PoolStage, BracketSlot } from '../types'

export type BracketSize = 4 | 8 | 16

const BRACKET_STAGES: Record<BracketSize, PoolStage[]> = {
  4: ['semifinal', 'final', 'third_place'],
  8: ['quarterfinal', 'semifinal', 'final', 'third_place'],
  16: ['quarterfinal', 'semifinal', 'final', 'third_place'],
}

/**
 * Generate a standard single-elimination bracket.
 * Seeds are placed using standard tournament seeding (1v8, 2v7, etc.)
 */
export function generateBracket(
  advancingTeams: Team[],
  tournamentId: string
): { slots: BracketSlot[]; matches: Omit<Match, 'score'>[] } {
  const size = advancingTeams.length as BracketSize
  if (![4, 8, 16].includes(size)) {
    throw new Error(`Bracket size ${size} not supported. Use 4, 8, or 16 teams.`)
  }

  const slots: BracketSlot[] = []
  const matches: Omit<Match, 'score'>[] = []

  // First round seeding: 1v(n), 2v(n-1)...
  const seeded = [...advancingTeams]
  const firstRound: [Team, Team][] = []

  for (let i = 0; i < size / 2; i++) {
    firstRound.push([seeded[i], seeded[size - 1 - i]])
  }

  const firstStage = size === 4 ? 'semifinal' : 'quarterfinal'

  firstRound.forEach(([t1, t2], i) => {
    const matchId = `${tournamentId}-${firstStage}-${i + 1}`
    matches.push({
      id: matchId,
      tournamentId,
      stage: firstStage,
      team1: t1,
      team2: t2,
      status: 'scheduled',
      approvalStatus: 'pending_umpire',
      duprSubmitted: false,
    })
    slots.push(
      { id: `slot-${firstStage}-${i * 2 + 1}`, round: firstStage, position: i * 2 + 1, team: t1, matchId },
      { id: `slot-${firstStage}-${i * 2 + 2}`, round: firstStage, position: i * 2 + 2, team: t2, matchId }
    )
  })

  // Subsequent rounds: semifinal, final, third place (TBD slots)
  const stages: PoolStage[] =
    size === 4
      ? ['final', 'third_place']
      : size === 8
      ? ['semifinal', 'final', 'third_place']
      : ['semifinal', 'final', 'third_place']

  stages.forEach((stage, si) => {
    const slotCount = stage === 'final' || stage === 'third_place' ? 2 : Math.pow(2, stages.length - si)
    const matchCount = slotCount / 2
    for (let i = 0; i < matchCount; i++) {
      const matchId = `${tournamentId}-${stage}-${i + 1}`
      matches.push({
        id: matchId,
        tournamentId,
        stage,
        team1: { id: 'TBD', name: 'TBD', players: [] },
        team2: { id: 'TBD', name: 'TBD', players: [] },
        status: 'scheduled',
        approvalStatus: 'pending_umpire',
        duprSubmitted: false,
      })
      slots.push(
        { id: `slot-${stage}-${i * 2 + 1}`, round: stage, position: i * 2 + 1, matchId },
        { id: `slot-${stage}-${i * 2 + 2}`, round: stage, position: i * 2 + 2, matchId }
      )
    }
  })

  return { slots, matches }
}

/**
 * Advance winner of a match to the next bracket slot.
 */
export function advanceWinner(
  completedMatchId: string,
  winnerTeam: Team,
  slots: BracketSlot[]
): BracketSlot[] {
  return slots.map((slot) => {
    if (slot.advancesTo === completedMatchId) {
      return { ...slot, team: winnerTeam }
    }
    return slot
  })
}
