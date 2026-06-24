import type { Match, Standing, Team } from '@court-iq/types'

/**
 * Returns the winner team id of a match based on games won.
 * Standard pickleball: best of 3 games, each game to 11 (win by 2),
 * except the deciding 3rd game which plays to 15.
 */
export function determineWinner(match: {
  teamAId: string
  teamBId: string
  teamAGame1: number | null
  teamBGame1: number | null
  teamAGame2: number | null
  teamBGame2: number | null
  teamAGame3: number | null
  teamBGame3: number | null
}): 'teamA' | 'teamB' | null {
  let teamAWins = 0
  let teamBWins = 0

  const games = [
    [match.teamAGame1 ?? 0, match.teamBGame1 ?? 0],
    [match.teamAGame2 ?? 0, match.teamBGame2 ?? 0],
    [match.teamAGame3 ?? 0, match.teamBGame3 ?? 0],
  ] as [number, number][]

  for (const [a, b] of games) {
    if (a === 0 && b === 0) continue
    if (a > b) teamAWins++
    else if (b > a) teamBWins++
  }

  if (teamAWins > teamBWins) return 'teamA'
  if (teamBWins > teamAWins) return 'teamB'
  return null
}

/**
 * Validates a match score for DUPR submission eligibility.
 * DUPR requires at least one team to reach 6 points in a game.
 */
export function isDUPREligible(match: {
  teamAGame1: number | null
  teamBGame1: number | null
}): boolean {
  const a = match.teamAGame1 ?? 0
  const b = match.teamBGame1 ?? 0
  return Math.max(a, b) >= 6
}

/**
 * Computes pool standings from a list of confirmed matches.
 */
export function computeStandings(
  teams: Team[],
  matches: Match[]
): Standing[] {
  const map: Record<string, Standing> = {}

  for (const team of teams) {
    map[team.id] = {
      rank: 0,
      team,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      gamesPlayed: 0,
    }
  }

  for (const match of matches) {
    if (match.status !== 'confirmed' || !match.score?.winner) continue
    const { teamA, teamB, score } = match
    const a = map[teamA.id]
    const b = map[teamB.id]
    if (!a || !b) continue

    const aPoints = score.teamAPoints
    const bPoints = score.teamBPoints

    a.pointsFor += aPoints
    a.pointsAgainst += bPoints
    b.pointsFor += bPoints
    b.pointsAgainst += aPoints
    a.gamesPlayed++
    b.gamesPlayed++

    if (score.winner === 'teamA') { a.wins++; b.losses++ }
    else { b.wins++; a.losses++ }
  }

  const sorted = Object.values(map).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    const aDiff = a.pointsFor - a.pointsAgainst
    const bDiff = b.pointsFor - b.pointsAgainst
    return bDiff - aDiff
  })

  return sorted.map((s, i) => ({ ...s, rank: i + 1, pointDiff: s.pointsFor - s.pointsAgainst }))
}
