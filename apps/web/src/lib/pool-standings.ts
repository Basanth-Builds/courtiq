// Pool standings calculation utility

import { TournamentMatch, Pool } from './tournament-data'

export interface TeamStanding {
  teamName: string
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
}

export interface PoolStandings {
  poolId: string
  poolName: string
  standings: TeamStanding[]
}

/**
 * Calculate standings for a pool based on match results
 */
export function calculatePoolStandings(pool: Pool): PoolStandings {
  const teamStats = new Map<string, TeamStanding>()

  // Initialize all teams from matches
  pool.matches.forEach((match) => {
    if (!teamStats.has(match.team1)) {
      teamStats.set(match.team1, {
        teamName: match.team1,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDifferential: 0,
      })
    }
    if (!teamStats.has(match.team2)) {
      teamStats.set(match.team2, {
        teamName: match.team2,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDifferential: 0,
      })
    }
  })

  // Calculate stats from completed/confirmed matches
  pool.matches.forEach((match) => {
    if (match.finalScore && match.status === 'CONFIRMED') {
      const team1Stats = teamStats.get(match.team1)!
      const team2Stats = teamStats.get(match.team2)!

      const team1Score = match.finalScore.team1
      const team2Score = match.finalScore.team2

      // Update points
      team1Stats.pointsFor += team1Score
      team1Stats.pointsAgainst += team2Score
      team2Stats.pointsFor += team2Score
      team2Stats.pointsAgainst += team1Score

      // Update wins/losses
      if (team1Score > team2Score) {
        team1Stats.wins++
        team2Stats.losses++
      } else if (team2Score > team1Score) {
        team2Stats.wins++
        team1Stats.losses++
      }

      // Update point differential
      team1Stats.pointDifferential = team1Stats.pointsFor - team1Stats.pointsAgainst
      team2Stats.pointDifferential = team2Stats.pointsFor - team2Stats.pointsAgainst
    }
  })

  // Sort by wins (descending), then point differential (descending)
  const standings = Array.from(teamStats.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    return b.pointDifferential - a.pointDifferential
  })

  return {
    poolId: pool.id,
    poolName: pool.name,
    standings,
  }
}

/**
 * Calculate standings for all pools in a category
 */
export function calculateCategoryStandings(pools: Pool[]): PoolStandings[] {
  return pools.map((pool) => calculatePoolStandings(pool))
}
