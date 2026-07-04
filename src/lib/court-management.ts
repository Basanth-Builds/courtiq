// Court management functions for D1 database
import { D1Database } from './d1-store'
import { Court, CourtBoardEntry, MatchWithGames } from './types-enhanced'

/**
 * Get all courts for a tournament
 */
export async function getCourts(db: D1Database, tournamentId: string): Promise<Court[]> {
  const result = await db
    .prepare('SELECT * FROM courts WHERE tournament_id = ? ORDER BY court_number')
    .bind(tournamentId)
    .all<any>()

  return result.results.map((row) => ({
    id: row.id,
    tournamentId: row.tournament_id,
    courtNumber: row.court_number,
    name: row.name,
    status: row.status,
    currentMatchId: row.current_match_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

/**
 * Get court board (all courts with their current matches)
 */
export async function getCourtBoard(db: D1Database, tournamentId: string): Promise<CourtBoardEntry[]> {
  const courts = await getCourts(db, tournamentId)
  const result: CourtBoardEntry[] = []

  for (const court of courts) {
    const entry: CourtBoardEntry = { court, currentMatch: null }

    if (court.currentMatchId) {
      // Get match details
      const match = await db
        .prepare('SELECT * FROM matches WHERE id = ?')
        .bind(court.currentMatchId)
        .first<any>()

      if (match) {
        // Get category name
        const category = await db
          .prepare('SELECT name FROM categories WHERE id = ?')
          .bind(match.category_id)
          .first<{ name: string }>()

        // Get games for this match
        const games = await db
          .prepare('SELECT * FROM games WHERE match_id = ? ORDER BY game_number')
          .bind(match.id)
          .all<any>()

        entry.currentMatch = {
          id: match.id,
          team1: match.team1,
          team2: match.team2,
          stage: match.stage,
          categoryName: category?.name || 'Unknown',
          games: games.results.map((g) => ({
            id: g.id,
            matchId: g.match_id,
            gameNumber: g.game_number,
            team1Score: g.team1_score,
            team2Score: g.team2_score,
            status: g.status,
            winner: g.winner,
            createdAt: g.created_at,
            updatedAt: g.updated_at,
          })),
        }
      }
    }

    result.push(entry)
  }

  return result
}

/**
 * Assign a match to a court
 */
export async function assignMatchToCourt(
  db: D1Database,
  matchId: string,
  courtId: string
): Promise<boolean> {
  try {
    // Update court
    await db
      .prepare('UPDATE courts SET current_match_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(matchId, 'IN_USE', courtId)
      .run()

    // Update match
    const court = await db
      .prepare('SELECT court_number FROM courts WHERE id = ?')
      .bind(courtId)
      .first<{ court_number: number }>()

    if (court) {
      await db
        .prepare('UPDATE matches SET court_number = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(court.court_number, 'IN_PROGRESS', matchId)
        .run()
    }

    return true
  } catch (error) {
    console.error('Error assigning match to court:', error)
    return false
  }
}

/**
 * Clear a court (mark as available)
 */
export async function clearCourt(db: D1Database, courtId: string): Promise<boolean> {
  try {
    // Get current match if any
    const court = await db
      .prepare('SELECT current_match_id FROM courts WHERE id = ?')
      .bind(courtId)
      .first<{ current_match_id: string | null }>()

    // Clear court
    await db
      .prepare('UPDATE courts SET current_match_id = NULL, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind('AVAILABLE', courtId)
      .run()

    // Update match if it exists
    if (court?.current_match_id) {
      await db
        .prepare('UPDATE matches SET court_number = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(court.current_match_id)
        .run()
    }

    return true
  } catch (error) {
    console.error('Error clearing court:', error)
    return false
  }
}

/**
 * Update court status
 */
export async function updateCourtStatus(
  db: D1Database,
  courtId: string,
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'
): Promise<boolean> {
  try {
    await db
      .prepare('UPDATE courts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(status, courtId)
      .run()

    return true
  } catch (error) {
    console.error('Error updating court status:', error)
    return false
  }
}
