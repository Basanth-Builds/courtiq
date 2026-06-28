// ============================================================
// Court IQ — Tournament State Machine
// Controls lifecycle: draft → registration → active → completed
// ============================================================

import type { TournamentStatus, Pool } from '../types'

export interface TournamentConfig {
  id: string
  name: string
  status: TournamentStatus
  poolCount: number
  playersPerPool: number
  advancersPerPool: number // typically 2
  bracketSize: 4 | 8 | 16
  format: 'singles' | 'doubles' | 'mixed_doubles'
  date: Date
  venue: string
  organizer: string
}

/**
 * Valid status transitions for a tournament.
 */
const VALID_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  draft: ['registration'],
  registration: ['active', 'draft'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function canTransition(
  from: TournamentStatus,
  to: TournamentStatus
): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function transitionTournament(
  tournament: TournamentConfig,
  to: TournamentStatus
): TournamentConfig {
  if (!canTransition(tournament.status, to)) {
    throw new Error(
      `Invalid status transition: ${tournament.status} → ${to}`
    )
  }
  return { ...tournament, status: to }
}

/**
 * Check if all pool matches are completed before advancing to playoffs.
 */
export function isPoolStageComplete(pools: Pool[]): boolean {
  return pools.every((pool) =>
    pool.matches.every(
      (m) => m.status === 'confirmed' || m.status === 'disputed'
    )
  )
}

/**
 * Calculate total matches in tournament.
 */
export function totalMatchCount(config: TournamentConfig): number {
  const teamsPerPool = config.playersPerPool
  const poolMatchCount = (teamsPerPool * (teamsPerPool - 1)) / 2
  const totalPoolMatches = poolMatchCount * config.poolCount

  // Playoff matches: depends on bracket size
  const bracketMatchCount = config.bracketSize - 1 + 1 // +1 for 3rd place
  return totalPoolMatches + bracketMatchCount
}
