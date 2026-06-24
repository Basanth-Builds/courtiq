// ============================================================
// Court IQ — DUPR CSV Formatter
// Generates DUPR-compatible CSV string from confirmed matches
// Format aligned with myDUPR club match upload spec
// ============================================================

import type { Match, DUPRMatchRow } from '../types'
import { getWinner } from '../scoring/scoring'
import { checkDUPREligibility } from './eligibility'

const CSV_HEADERS = [
  'Match Date',
  'Format',
  'Tournament',
  'Player 1 DUPR ID',
  'Player 1 Name',
  'Player 2 DUPR ID',
  'Player 2 Name',
  'Opponent 1 DUPR ID',
  'Opponent 1 Name',
  'Opponent 2 DUPR ID',
  'Opponent 2 Name',
  'Winner Score',
  'Loser Score',
]

function escapeCSV(value: string | undefined): string {
  if (!value) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Convert a confirmed match into a DUPRMatchRow.
 * Handles both singles and doubles formats.
 */
export function matchToDUPRRow(
  match: Match,
  tournamentName: string
): DUPRMatchRow | null {
  const eligibility = checkDUPREligibility(match)
  if (!eligibility.eligible || !match.score || !match.completedAt) return null

  const winner = getWinner(match.score)
  if (!winner) return null

  const winnerTeam = winner === 1 ? match.team1 : match.team2
  const loserTeam = winner === 1 ? match.team2 : match.team1
  const winnerScore = winner === 1 ? match.score.team1Points : match.score.team2Points
  const loserScore = winner === 1 ? match.score.team2Points : match.score.team1Points

  const isDoubles = winnerTeam.players.length === 2
  const format = isDoubles ? 'doubles' : 'singles'

  return {
    playerOneDUPRId: winnerTeam.players[0]?.duprId ?? '',
    playerOneName: winnerTeam.players[0]?.name ?? '',
    playerTwoDUPRId: isDoubles ? winnerTeam.players[1]?.duprId : undefined,
    playerTwoName: isDoubles ? winnerTeam.players[1]?.name : undefined,
    opponentOneDUPRId: loserTeam.players[0]?.duprId ?? '',
    opponentOneName: loserTeam.players[0]?.name ?? '',
    opponentTwoDUPRId: isDoubles ? loserTeam.players[1]?.duprId : undefined,
    opponentTwoName: isDoubles ? loserTeam.players[1]?.name : undefined,
    winnerScore,
    loserScore,
    matchDate: match.completedAt.toISOString().split('T')[0],
    format,
    tournamentName,
  }
}

/**
 * Generate a full DUPR CSV string from an array of matches.
 * Skips ineligible matches and logs exclusion reasons.
 */
export function generateDUPRCsv(
  matches: Match[],
  tournamentName: string
): { csv: string; included: number; excluded: { matchId: string; reasons: string[] }[] } {
  const excluded: { matchId: string; reasons: string[] }[] = []
  const rows: string[] = [CSV_HEADERS.join(',')]

  matches.forEach((match) => {
    const eligibility = checkDUPREligibility(match)
    if (!eligibility.eligible) {
      excluded.push({ matchId: match.id, reasons: eligibility.reasons })
      return
    }
    const row = matchToDUPRRow(match, tournamentName)
    if (!row) return

    rows.push(
      [
        escapeCSV(row.matchDate),
        escapeCSV(row.format),
        escapeCSV(row.tournamentName),
        escapeCSV(row.playerOneDUPRId),
        escapeCSV(row.playerOneName),
        escapeCSV(row.playerTwoDUPRId),
        escapeCSV(row.playerTwoName),
        escapeCSV(row.opponentOneDUPRId),
        escapeCSV(row.opponentOneName),
        escapeCSV(row.opponentTwoDUPRId),
        escapeCSV(row.opponentTwoName),
        String(row.winnerScore),
        String(row.loserScore),
      ].join(',')
    )
  })

  return {
    csv: rows.join('\n'),
    included: rows.length - 1,
    excluded,
  }
}
