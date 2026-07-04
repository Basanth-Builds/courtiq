import { D1Database } from './d1-store'
import { Game, MatchWithGames } from './types-enhanced'

type MatchRow = {
  id: string
  tournament_id: string
  category_id: string
  pool_id: string | null
  team1: string
  team2: string
  stage: string
  status: string
  team1_score: number | null
  team2_score: number | null
  court_number: number | null
  created_at: string
  updated_at: string
}

type GameRow = {
  id: string
  match_id: string
  game_number: 1 | 2 | 3
  team1_score: number
  team2_score: number
  status: Game['status']
  winner: Game['winner']
  created_at: string
  updated_at: string
}

type MatchWinTotals = {
  team1Wins: number
  team2Wins: number
}

function mapGame(row: GameRow): Game {
  return {
    id: row.id,
    matchId: row.match_id,
    gameNumber: row.game_number,
    team1Score: row.team1_score,
    team2Score: row.team2_score,
    status: row.status,
    winner: row.winner,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getGameById(db: D1Database, gameId: string): Promise<GameRow | null> {
  return db.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first<GameRow>()
}

async function getMatchById(db: D1Database, matchId: string): Promise<MatchRow | null> {
  return db.prepare('SELECT * FROM matches WHERE id = ?').bind(matchId).first<MatchRow>()
}

async function getMatchWins(db: D1Database, matchId: string): Promise<MatchWinTotals> {
  const totals = await db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN winner = 'team1' THEN 1 ELSE 0 END), 0) AS team1Wins,
        COALESCE(SUM(CASE WHEN winner = 'team2' THEN 1 ELSE 0 END), 0) AS team2Wins
      FROM games
      WHERE match_id = ?`
    )
    .bind(matchId)
    .first<MatchWinTotals>()

  return {
    team1Wins: totals?.team1Wins ?? 0,
    team2Wins: totals?.team2Wins ?? 0,
  }
}

export async function getMatchWithGames(
  db: D1Database,
  matchId: string
): Promise<MatchWithGames | null> {
  const match = await getMatchById(db, matchId)

  if (!match) return null

  const games = await db
    .prepare('SELECT * FROM games WHERE match_id = ? ORDER BY game_number')
    .bind(matchId)
    .all<GameRow>()

  return {
    id: match.id,
    tournamentId: match.tournament_id,
    categoryId: match.category_id,
    poolId: match.pool_id,
    team1: match.team1,
    team2: match.team2,
    stage: match.stage,
    status: match.status,
    team1Score: match.team1_score,
    team2Score: match.team2_score,
    courtNumber: match.court_number,
    createdAt: match.created_at,
    updatedAt: match.updated_at,
    games: (games.results ?? []).map(mapGame),
  }
}

export async function updateGameScore(
  db: D1Database,
  gameId: string,
  team1Score: number,
  team2Score: number
): Promise<boolean> {
  if (
    !Number.isInteger(team1Score) ||
    !Number.isInteger(team2Score) ||
    team1Score < 0 ||
    team2Score < 0
  ) {
    return false
  }

  const game = await getGameById(db, gameId)

  if (!game) return false

  const status: Game['status'] = game.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'

  const [gameResult, matchResult] = await db.batch([
    db
      .prepare(
        'UPDATE games SET team1_score = ?, team2_score = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
      .bind(team1Score, team2Score, status, gameId),
    db
      .prepare(
        "UPDATE matches SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(game.match_id),
  ])

  return Boolean(gameResult?.success && matchResult?.success)
}

export async function completeGame(
  db: D1Database,
  gameId: string,
  winner: 'team1' | 'team2'
): Promise<boolean> {
  const game = await getGameById(db, gameId)

  if (!game) return false

  const completeResult = await db
    .prepare(
      "UPDATE games SET status = 'COMPLETED', winner = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(winner, gameId)
    .run()

  if (!completeResult.success) return false

  const { team1Wins, team2Wins } = await getMatchWins(db, game.match_id)

  if (team1Wins >= 2 || team2Wins >= 2 || game.game_number === 3) {
    return completeMatch(db, game.match_id)
  }

  const nextGameNumber = (game.game_number + 1) as 2 | 3
  const nextGame = await db
    .prepare('SELECT * FROM games WHERE match_id = ? AND game_number = ?')
    .bind(game.match_id, nextGameNumber)
    .first<GameRow>()

  if (nextGame) {
    if (nextGame.status === 'NOT_STARTED') {
      await db
        .prepare(
          "UPDATE games SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        .bind(nextGame.id)
        .run()
    }

    await db
      .prepare(
        "UPDATE matches SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(game.match_id)
      .run()

    return true
  }

  return Boolean(await startNewGame(db, game.match_id, nextGameNumber))
}

export async function startNewGame(
  db: D1Database,
  matchId: string,
  gameNumber: 1 | 2 | 3
): Promise<Game | null> {
  const match = await getMatchById(db, matchId)

  if (!match) return null

  const existingGame = await db
    .prepare('SELECT * FROM games WHERE match_id = ? AND game_number = ?')
    .bind(matchId, gameNumber)
    .first<GameRow>()

  if (existingGame) {
    if (existingGame.status === 'NOT_STARTED') {
      await db
        .prepare(
          "UPDATE games SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        .bind(existingGame.id)
        .run()
    }

    await db
      .prepare(
        "UPDATE matches SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(matchId)
      .run()

    const refreshedGame = await db
      .prepare('SELECT * FROM games WHERE id = ?')
      .bind(existingGame.id)
      .first<GameRow>()

    return refreshedGame ? mapGame(refreshedGame) : mapGame(existingGame)
  }

  const gameId = `${matchId}-game-${gameNumber}`
  const [insertResult, matchResult] = await db.batch([
    db
      .prepare(
        "INSERT INTO games (id, match_id, game_number, team1_score, team2_score, status, created_at, updated_at) VALUES (?, ?, ?, 0, 0, 'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      )
      .bind(gameId, matchId, gameNumber),
    db
      .prepare(
        "UPDATE matches SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(matchId),
  ])

  if (!insertResult?.success || !matchResult?.success) return null

  const game = await db.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first<GameRow>()
  return game ? mapGame(game) : null
}

export async function completeMatch(db: D1Database, matchId: string): Promise<boolean> {
  const match = await getMatchById(db, matchId)

  if (!match) return false

  const { team1Wins, team2Wins } = await getMatchWins(db, matchId)

  if (team1Wins === 0 && team2Wins === 0) return false

  const result = await db
    .prepare(
      "UPDATE matches SET team1_score = ?, team2_score = ?, status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(team1Wins, team2Wins, matchId)
    .run()

  return result.success
}
