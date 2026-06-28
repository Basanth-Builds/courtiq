// ============================================================
// Court IQ — Seeding & Pool Generation Engine
// ============================================================

import type { Team, Pool, PoolStanding, Match } from '../types'

/**
 * Sort teams by DUPR rating descending for initial seeding.
 * Teams without a DUPR rating are placed at the bottom.
 */
export function seedTeamsByDUPR(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    const ratingA = a.duprRating ?? 0
    const ratingB = b.duprRating ?? 0
    return ratingB - ratingA
  })
}

/**
 * Distribute seeded teams into pools.
 * Uses snake-draft distribution for balanced pools.
 * e.g. 4 pools: seed 1→A, 2→B, 3→C, 4→D, 5→D, 6→C, 7→B, 8→A...
 */
export function distributeIntoPools(teams: Team[], poolCount: number): Pool[] {
  const seeded = seedTeamsByDUPR(teams)
  const pools: Pool[] = Array.from({ length: poolCount }, (_, i) => ({
    id: `pool-${i}`,
    name: `Pool ${String.fromCharCode(65 + i)}`, // A, B, C...
    teams: [],
    matches: [],
  }))

  seeded.forEach((team, index) => {
    const cycle = Math.floor(index / poolCount)
    const posInCycle = index % poolCount
    const poolIndex = cycle % 2 === 0 ? posInCycle : poolCount - 1 - posInCycle
    pools[poolIndex].teams.push(team)
  })

  return pools
}

/**
 * Generate round-robin match schedule for a single pool.
 * Returns all match pairings (each team plays every other team once).
 */
export function generateRoundRobinMatches(
  pool: Pool,
  tournamentId: string
): Omit<Match, 'team1' | 'team2'>[] {
  const teams = pool.teams
  const matches: Omit<Match, 'team1' | 'team2'>[] = []
  let matchIndex = 0

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `${pool.id}-match-${matchIndex++}`,
        tournamentId,
        poolId: pool.id,
        stage: 'pool',
        status: 'scheduled',
        approvalStatus: 'pending_umpire',
        duprSubmitted: false,
        duprEligible: undefined,
      } as Omit<Match, 'team1' | 'team2'>)
    }
  }
  return matches
}

/**
 * Calculate pool standings from completed matches.
 * Ranking priority: wins → point differential → points for.
 */
export function calculatePoolStandings(pool: Pool): PoolStanding[] {
  const standingsMap = new Map<string, PoolStanding>()

  pool.teams.forEach((team) => {
    standingsMap.set(team.id, {
      team,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDifferential: 0,
      rank: 0,
    })
  })

  pool.matches.forEach((match) => {
    if (match.status !== 'confirmed' || !match.score?.isComplete) return

    const s1 = standingsMap.get(match.team1.id)!
    const s2 = standingsMap.get(match.team2.id)!
    const { team1Points, team2Points } = match.score

    s1.matchesPlayed++
    s2.matchesPlayed++
    s1.pointsFor += team1Points
    s1.pointsAgainst += team2Points
    s2.pointsFor += team2Points
    s2.pointsAgainst += team1Points

    if (team1Points > team2Points) {
      s1.wins++
      s2.losses++
    } else {
      s2.wins++
      s1.losses++
    }

    s1.pointDifferential = s1.pointsFor - s1.pointsAgainst
    s2.pointDifferential = s2.pointsFor - s2.pointsAgainst
  })

  const standings = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.pointDifferential !== a.pointDifferential)
      return b.pointDifferential - a.pointDifferential
    return b.pointsFor - a.pointsFor
  })

  standings.forEach((s, i) => (s.rank = i + 1))
  return standings
}

/**
 * Get top N teams from pool for playoff advancement.
 */
export function getPlayoffAdvancers(pool: Pool, topN: number = 2): Team[] {
  const standings = calculatePoolStandings(pool)
  return standings.slice(0, topN).map((s) => s.team)
}
