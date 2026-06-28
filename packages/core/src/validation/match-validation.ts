// ============================================================
// Court IQ — Match Validation
// Enforces rules before umpire save and referee approval
// ============================================================

import type { Match, MatchScore } from '../types'
import { validateScore, isMatchComplete } from '../scoring/scoring'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Full pre-save validation run by umpire before submitting score.
 */
export function validateMatchForUmpire(
  match: Match,
  score: MatchScore
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const scoreCheck = validateScore(score.team1Points, score.team2Points)
  if (!scoreCheck.valid) errors.push(scoreCheck.error!)

  if (!isMatchComplete(score)) {
    warnings.push(
      'Score does not yet have a winner — match will be saved as in progress'
    )
  }

  if (match.status === 'confirmed') {
    errors.push('Match is already confirmed and cannot be edited')
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Full pre-approval validation run by referee before confirming.
 */
export function validateMatchForReferee(
  match: Match
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (match.status !== 'pending_review') {
    errors.push('Match must be in pending_review state for referee approval')
  }

  if (!match.score?.isComplete) {
    errors.push('Score must be finalized before referee approval')
  }

  if (!match.umpireId) {
    errors.push('No umpire is assigned to this match')
  }

  const allPlayers = [...match.team1.players, ...match.team2.players]
  const missingDUPR = allPlayers.filter((p) => !p.duprId)
  if (missingDUPR.length > 0) {
    warnings.push(
      `${missingDUPR.length} player(s) missing DUPR IDs — match will be excluded from DUPR submission`
    )
  }

  return { valid: errors.length === 0, errors, warnings }
}
