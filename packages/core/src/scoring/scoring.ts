// ============================================================
// Court IQ — Scoring Engine
// Handles point validation, game completion logic
// ============================================================

import type { MatchScore, Match } from '../types'

/** Standard pickleball scoring: first to 11, win by 2. Rally scoring. */
export const PICKLEBALL_WIN_SCORE = 11
export const PICKLEBALL_WIN_BY = 2
export const DUPR_MIN_POINTS = 6 // DUPR requires at least 6 points for winner

/**
 * Determine if a match score is complete (a winner exists).
 */
export function isMatchComplete(score: MatchScore): boolean {
  const { team1Points, team2Points } = score
  const maxPoints = Math.max(team1Points, team2Points)
  const minPoints = Math.min(team1Points, team2Points)

  if (maxPoints < PICKLEBALL_WIN_SCORE) return false
  if (maxPoints - minPoints < PICKLEBALL_WIN_BY) return false
  return true
}

/**
 * Returns winner team index (1 or 2) or null if match not complete.
 */
export function getWinner(score: MatchScore): 1 | 2 | null {
  if (!isMatchComplete(score)) return null
  return score.team1Points > score.team2Points ? 1 : 2
}

/**
 * Returns the score string in "winner-loser" format.
 */
export function formatScore(score: MatchScore): string {
  const winner = getWinner(score)
  if (!winner) return `${score.team1Points}-${score.team2Points} (In Progress)`
  const [w, l] =
    winner === 1
      ? [score.team1Points, score.team2Points]
      : [score.team2Points, score.team1Points]
  return `${w}-${l}`
}

/**
 * Validate a raw score input before saving.
 */
export function validateScore(
  team1Points: number,
  team2Points: number
): { valid: boolean; error?: string } {
  if (!Number.isInteger(team1Points) || !Number.isInteger(team2Points)) {
    return { valid: false, error: 'Points must be whole numbers' }
  }
  if (team1Points < 0 || team2Points < 0) {
    return { valid: false, error: 'Points cannot be negative' }
  }
  if (team1Points > 30 || team2Points > 30) {
    return { valid: false, error: 'Points exceed maximum allowed (30)' }
  }
  if (team1Points === team2Points && team1Points >= PICKLEBALL_WIN_SCORE) {
    return { valid: false, error: 'Tied score at win threshold is invalid' }
  }
  return { valid: true }
}

/**
 * Compute point differential for tiebreaker use.
 */
export function pointDifferential(score: MatchScore): number {
  return score.team1Points - score.team2Points
}
