// Bracket generation system for single-elimination playoffs
// Generates brackets from pool standings with automatic seeding

import { Pool, TournamentMatch, Category, TOURNAMENTS } from './tournament-data'
import { calculatePoolStandings, TeamStanding } from './pool-standings'

export interface BracketMatch {
  id: string
  team1: string
  team2: string
  stage: 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL' | 'THIRD_PLACE'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CONFIRMED'
  finalScore?: { team1: number; team2: number }
  nextMatchId?: string // For progression
  bracketPosition: number // Position in bracket (0-based)
}

export interface BracketRound {
  name: string
  matches: BracketMatch[]
}

export interface Bracket {
  rounds: BracketRound[]
  thirdPlaceMatch?: BracketMatch
}

/**
 * Get top N teams from all pools combined
 */
export function getTopTeamsFromPools(pools: Pool[], count: number): string[] {
  const allStandings: Array<TeamStanding & { poolId: string }> = []

  pools.forEach(pool => {
    const poolStandings = calculatePoolStandings(pool)
    poolStandings.standings.forEach((standing: TeamStanding) => {
      allStandings.push({ ...standing, poolId: pool.id })
    })
  })

  // Sort by: wins desc, then point differential desc, then points for desc
  allStandings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.pointDifferential !== a.pointDifferential) return b.pointDifferential - a.pointDifferential
    return b.pointsFor - a.pointsFor
  })

  return allStandings.slice(0, count).map(s => s.teamName)
}

/**
 * Generate single-elimination bracket from pool results
 * Supports 4, 8, 16 team brackets
 */
export function generateBracket(pools: Pool[], teamCount: number = 8): Bracket {
  // Validate team count (must be power of 2)
  if (![4, 8, 16].includes(teamCount)) {
    throw new Error('Bracket must have 4, 8, or 16 teams')
  }

  const topTeams = getTopTeamsFromPools(pools, teamCount)
  
  // If we don't have enough teams, throw error
  if (topTeams.length < teamCount) {
    throw new Error(`Not enough teams for ${teamCount}-team bracket. Found ${topTeams.length} teams.`)
  }

  const rounds: BracketRound[] = []
  let matchIdCounter = 1000

  // Seeding pairs (1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5, etc.)
  const seedingPairs = generateSeedingPairs(teamCount)

  // First round (Quarterfinals or Round 1)
  const firstRoundMatches: BracketMatch[] = []
  seedingPairs.forEach((pair, idx) => {
    const matchId = `playoff_${matchIdCounter++}`
    firstRoundMatches.push({
      id: matchId,
      team1: topTeams[pair[0] - 1] || 'TBD',
      team2: topTeams[pair[1] - 1] || 'TBD',
      stage: teamCount === 8 ? 'QUARTERFINAL' : 'SEMIFINAL',
      status: 'SCHEDULED',
      bracketPosition: idx
    })
  })

  let roundName = teamCount === 8 ? 'Quarterfinals' : teamCount === 4 ? 'Semifinals' : 'Round 1'
  rounds.push({ name: roundName, matches: firstRoundMatches })

  // Generate subsequent rounds
  let currentRoundMatches = firstRoundMatches
  let nextRoundSize = currentRoundMatches.length / 2

  while (nextRoundSize >= 1) {
    const nextRoundMatches: BracketMatch[] = []
    
    for (let i = 0; i < nextRoundSize; i++) {
      const matchId = `playoff_${matchIdCounter++}`
      const match1Idx = i * 2
      const match2Idx = i * 2 + 1
      
      // Determine stage
      let stage: 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL' = 'SEMIFINAL'
      if (nextRoundSize === 1) stage = 'FINAL'
      else if (teamCount === 16 && nextRoundSize === 4) stage = 'QUARTERFINAL'
      
      nextRoundMatches.push({
        id: matchId,
        team1: 'Winner of Match ' + (match1Idx + 1),
        team2: 'Winner of Match ' + (match2Idx + 1),
        stage,
        status: 'SCHEDULED',
        bracketPosition: i
      })

      // Set next match IDs for progression
      if (currentRoundMatches[match1Idx]) {
        currentRoundMatches[match1Idx].nextMatchId = matchId
      }
      if (currentRoundMatches[match2Idx]) {
        currentRoundMatches[match2Idx].nextMatchId = matchId
      }
    }

    roundName = nextRoundSize === 1 ? 'Final' : 'Semifinals'
    rounds.push({ name: roundName, matches: nextRoundMatches })

    currentRoundMatches = nextRoundMatches
    nextRoundSize = Math.floor(nextRoundSize / 2)
  }

  // Add third place match
  const semiFinalMatches = rounds.find(r => r.name === 'Semifinals')?.matches || []
  let thirdPlaceMatch: BracketMatch | undefined
  
  if (semiFinalMatches.length === 2) {
    thirdPlaceMatch = {
      id: `playoff_${matchIdCounter++}`,
      team1: 'Loser of Semi 1',
      team2: 'Loser of Semi 2',
      stage: 'THIRD_PLACE',
      status: 'SCHEDULED',
      bracketPosition: 0
    }
  }

  return { rounds, thirdPlaceMatch }
}

/**
 * Generate seeding pairs for bracket (1v8, 2v7, 3v6, 4v5, etc.)
 */
function generateSeedingPairs(teamCount: number): Array<[number, number]> {
  if (teamCount === 4) {
    return [[1, 4], [2, 3]]
  }
  if (teamCount === 8) {
    return [[1, 8], [4, 5], [2, 7], [3, 6]]
  }
  if (teamCount === 16) {
    return [
      [1, 16], [8, 9], [4, 13], [5, 12],
      [2, 15], [7, 10], [3, 14], [6, 11]
    ]
  }
  return []
}

/**
 * Update bracket based on match results
 * When a match is completed, advance winner to next round
 */
export function updateBracketWithResults(
  bracket: Bracket,
  completedMatchId: string,
  winner: 'team1' | 'team2'
): Bracket {
  const allMatches = [
    ...bracket.rounds.flatMap(r => r.matches),
    ...(bracket.thirdPlaceMatch ? [bracket.thirdPlaceMatch] : [])
  ]

  const completedMatch = allMatches.find(m => m.id === completedMatchId)
  if (!completedMatch) return bracket

  const winnerName = winner === 'team1' ? completedMatch.team1 : completedMatch.team2
  const loserName = winner === 'team1' ? completedMatch.team2 : completedMatch.team1

  // If this match has a nextMatchId, update that match
  if (completedMatch.nextMatchId) {
    const nextMatch = allMatches.find(m => m.id === completedMatch.nextMatchId)
    if (nextMatch) {
      // Determine which slot (team1 or team2) this winner goes into
      // Based on bracket position
      if (completedMatch.bracketPosition % 2 === 0) {
        nextMatch.team1 = winnerName
      } else {
        nextMatch.team2 = winnerName
      }
    }
  }

  // If this was a semifinal, update third place match with loser
  if (completedMatch.stage === 'SEMIFINAL' && bracket.thirdPlaceMatch) {
    if (completedMatch.bracketPosition === 0) {
      bracket.thirdPlaceMatch.team1 = loserName
    } else {
      bracket.thirdPlaceMatch.team2 = loserName
    }
  }

  return bracket
}

/**
 * Convert bracket to playoff matches format
 */
export function bracketToPlayoffMatches(bracket: Bracket): TournamentMatch[] {
  const matches: TournamentMatch[] = []

  bracket.rounds.forEach(round => {
    round.matches.forEach(match => {
      matches.push({
        id: match.id,
        team1: match.team1,
        team2: match.team2,
        stage: match.stage,
        status: match.status,
        finalScore: match.finalScore
      })
    })
  })

  if (bracket.thirdPlaceMatch) {
    matches.push({
      id: bracket.thirdPlaceMatch.id,
      team1: bracket.thirdPlaceMatch.team1,
      team2: bracket.thirdPlaceMatch.team2,
      stage: bracket.thirdPlaceMatch.stage,
      status: bracket.thirdPlaceMatch.status,
      finalScore: bracket.thirdPlaceMatch.finalScore
    })
  }

  return matches
}

/**
 * Get bracket visualization data for display
 */
export interface BracketVisualization {
  columns: Array<{
    name: string
    matches: Array<{
      id: string
      team1: string
      team2: string
      score1?: number
      score2?: number
      status: string
    }>
  }>
  thirdPlace?: {
    id: string
    team1: string
    team2: string
    score1?: number
    score2?: number
    status: string
  }
}

export function getBracketVisualization(bracket: Bracket): BracketVisualization {
  const columns = bracket.rounds.map(round => ({
    name: round.name,
    matches: round.matches.map(m => ({
      id: m.id,
      team1: m.team1,
      team2: m.team2,
      score1: m.finalScore?.team1,
      score2: m.finalScore?.team2,
      status: m.status
    }))
  }))

  const thirdPlace = bracket.thirdPlaceMatch ? {
    id: bracket.thirdPlaceMatch.id,
    team1: bracket.thirdPlaceMatch.team1,
    team2: bracket.thirdPlaceMatch.team2,
    score1: bracket.thirdPlaceMatch.finalScore?.team1,
    score2: bracket.thirdPlaceMatch.finalScore?.team2,
    status: bracket.thirdPlaceMatch.status
  } : undefined

  return { columns, thirdPlace }
}
