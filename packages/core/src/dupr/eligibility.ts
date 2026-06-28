// ============================================================
// Court IQ — DUPR Eligibility Checker
// Based on DUPR rules for match submission
// ============================================================

import type { Match } from '../types'
import { DUPR_MIN_POINTS } from '../scoring/scoring'

export interface DUPREligibilityResult {
  eligible: boolean
  reasons: string[]
}

/**
 * Check if a confirmed match is eligible for DUPR submission.
 * DUPR requires:
 * 1. Match must be confirmed by both umpire and referee.
 * 2. Winner must have scored at least 6 points.
 * 3. Both teams must have DUPR IDs registered.
 * 4. Match must be complete (has a winner).
 */
export function checkDUPREligibility(match: Match): DUPREligibilityResult {
  const reasons: string[] = []

  if (match.approvalStatus !== 'approved') {
    reasons.push('Match has not been approved by the referee')
  }

  if (!match.score?.isComplete) {
    reasons.push('Match score is not finalized')
  }

  if (match.score) {
    const maxPoints = Math.max(match.score.team1Points, match.score.team2Points)
    if (maxPoints < DUPR_MIN_POINTS) {
      reasons.push(
        `Winner scored only ${maxPoints} points — DUPR requires a minimum of ${DUPR_MIN_POINTS}`
      )
    }
  }

  const allPlayers = [...match.team1.players, ...match.team2.players]
  const missingDUPR = allPlayers.filter((p) => !p.duprId)
  if (missingDUPR.length > 0) {
    reasons.push(
      `${missingDUPR.length} player(s) are missing DUPR IDs: ${missingDUPR.map((p) => p.name).join(', ')}`
    )
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  }
}
