import type { Match, DUPRRow } from '@court-iq/types'

/**
 * Converts a confirmed match into a DUPR-formatted CSV row.
 * Validates DUPR eligibility before generating.
 */
export function matchToDUPRRow(match: Match): DUPRRow | null {
  if (!match.score || !match.score.winner) return null

  const { teamA, teamB, score } = match
  const player1 = teamA.players[0]
  const player2 = teamA.players[1]
  const opp1 = teamB.players[0]
  const opp2 = teamB.players[1]

  if (!player1?.duprId || !opp1?.duprId) return null

  const maxPoints = Math.max(score.teamAPoints, score.teamBPoints)
  if (maxPoints < 6) return null // DUPR minimum

  return {
    Player1_DUPR_ID: player1.duprId,
    Player2_DUPR_ID: player2?.duprId ?? '',
    Opponent1_DUPR_ID: opp1.duprId,
    Opponent2_DUPR_ID: opp2?.duprId ?? '',
    Player1_Score: score.teamAPoints,
    Opponent1_Score: score.teamBPoints,
    Match_Date: new Date(match.completedAt ?? match.scheduledAt).toISOString().split('T')[0]!,
    Location: '',
    Format: teamA.players.length === 2 ? 'doubles' : 'singles',
  }
}

/**
 * Generates a full DUPR CSV string from an array of matches.
 */
export function generateDUPRCSV(matches: Match[]): string {
  const header = [
    'Player1_DUPR_ID',
    'Player2_DUPR_ID',
    'Opponent1_DUPR_ID',
    'Opponent2_DUPR_ID',
    'Player1_Score',
    'Opponent1_Score',
    'Match_Date',
    'Location',
    'Format',
  ].join(',')

  const rows = matches
    .map(matchToDUPRRow)
    .filter(Boolean)
    .map((row) => Object.values(row!).join(','))

  return [header, ...rows].join('\n')
}
