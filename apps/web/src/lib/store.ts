// Simple store with Cloudflare KV persistence fallback
// In dev: uses in-memory store. In production: can use KV for persistence.
import { TOURNAMENTS, TournamentData, TournamentMatch } from './tournament-data'
import { Game, MatchWithGames } from './types-enhanced'

type StoreData = typeof TOURNAMENTS

type MatchLocation = {
  match: TournamentMatch
  tournament: TournamentData
  categoryId: string
}

// Initialize with demo data
let currentData: StoreData = JSON.parse(JSON.stringify(TOURNAMENTS))
let currentGames: Game[] = buildInitialGames(currentData)
let lastUpdatedAt = new Date().toISOString()

// Key for KV storage
const STORE_KEY = 'tournament_data'

function touch() {
  lastUpdatedAt = new Date().toISOString()
  return lastUpdatedAt
}

function buildInitialGames(data: StoreData): Game[] {
  const timestamp = new Date().toISOString()
  const games: Game[] = []

  for (const tournament of data) {
    for (const category of tournament.categories) {
      for (const pool of category.pools) {
        for (const match of pool.matches) {
          games.push(createInitialGame(match, timestamp))
        }
      }

      for (const match of category.playoffMatches) {
        games.push(createInitialGame(match, timestamp))
      }
    }
  }

  return games
}

function createInitialGame(match: TournamentMatch, timestamp: string): Game {
  const completed = Boolean(match.finalScore)

  return {
    id: `${match.id}-game-1`,
    matchId: match.id,
    gameNumber: 1,
    team1Score: match.finalScore?.team1 ?? 0,
    team2Score: match.finalScore?.team2 ?? 0,
    status: completed
      ? 'COMPLETED'
      : match.status === 'IN_PROGRESS'
        ? 'IN_PROGRESS'
        : 'NOT_STARTED',
    winner: completed
      ? match.finalScore!.team1 > match.finalScore!.team2
        ? 'team1'
        : 'team2'
      : null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function cloneData(): StoreData {
  return JSON.parse(JSON.stringify(currentData))
}

function cloneGames(): Game[] {
  return JSON.parse(JSON.stringify(currentGames))
}

function findMatchInData(data: StoreData, matchId: string): MatchLocation | null {
  for (const tournament of data) {
    for (const category of tournament.categories) {
      for (const pool of category.pools) {
        const match = pool.matches.find((item) => item.id === matchId)
        if (match) {
          return { match, tournament, categoryId: category.id }
        }
      }

      const playoffMatch = category.playoffMatches.find((item) => item.id === matchId)
      if (playoffMatch) {
        return { match: playoffMatch, tournament, categoryId: category.id }
      }
    }
  }

  return null
}

function countMatchWins(games: Game[], matchId: string) {
  const matchGames = games.filter((game) => game.matchId === matchId)

  return matchGames.reduce(
    (totals, game) => {
      if (game.winner === 'team1') totals.team1 += 1
      if (game.winner === 'team2') totals.team2 += 1
      return totals
    },
    { team1: 0, team2: 0 }
  )
}

function syncMatchScore(
  data: StoreData,
  games: Game[],
  matchId: string,
  status?: TournamentMatch['status']
): boolean {
  const location = findMatchInData(data, matchId)

  if (!location) return false

  const wins = countMatchWins(games, matchId)
  location.match.finalScore =
    wins.team1 > 0 || wins.team2 > 0
      ? {
          team1: wins.team1,
          team2: wins.team2,
        }
      : undefined

  if (status) {
    location.match.status = status
  }

  return true
}

export function getTournamentStore() {
  return currentData
}

export function getMatchWithGames(matchId: string): MatchWithGames | null {
  const location = findMatchInData(currentData, matchId)

  if (!location) return null

  return {
    id: location.match.id,
    tournamentId: location.tournament.id,
    categoryId: location.categoryId,
    poolId: location.match.poolId ?? null,
    team1: location.match.team1,
    team2: location.match.team2,
    stage: location.match.stage,
    status: location.match.status,
    team1Score: location.match.finalScore?.team1 ?? null,
    team2Score: location.match.finalScore?.team2 ?? null,
    courtNumber: location.match.courtNumber ?? null,
    createdAt: lastUpdatedAt,
    updatedAt: lastUpdatedAt,
    games: currentGames
      .filter((game) => game.matchId === matchId)
      .sort((a, b) => a.gameNumber - b.gameNumber),
  }
}

export function updateGameScore(gameId: string, team1Score: number, team2Score: number) {
  if (
    !Number.isInteger(team1Score) ||
    !Number.isInteger(team2Score) ||
    team1Score < 0 ||
    team2Score < 0
  ) {
    return false
  }

  const updatedGames = cloneGames()
  const updatedData = cloneData()
  const game = updatedGames.find((item) => item.id === gameId)

  if (!game) return false

  const updatedAt = touch()
  game.team1Score = team1Score
  game.team2Score = team2Score
  game.status = game.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
  game.updatedAt = updatedAt

  if (!syncMatchScore(updatedData, updatedGames, game.matchId, 'IN_PROGRESS')) {
    return false
  }

  currentGames = updatedGames
  currentData = updatedData
  return true
}

export function completeGame(gameId: string, winner: 'team1' | 'team2') {
  const updatedGames = cloneGames()
  const updatedData = cloneData()
  const game = updatedGames.find((item) => item.id === gameId)

  if (!game) return false

  const updatedAt = touch()
  game.status = 'COMPLETED'
  game.winner = winner
  game.updatedAt = updatedAt

  const wins = countMatchWins(updatedGames, game.matchId)

  if (wins.team1 >= 2 || wins.team2 >= 2 || game.gameNumber === 3) {
    if (!syncMatchScore(updatedData, updatedGames, game.matchId, 'CONFIRMED')) {
      return false
    }
  } else {
    if (!syncMatchScore(updatedData, updatedGames, game.matchId, 'IN_PROGRESS')) {
      return false
    }

    const nextGameNumber = (game.gameNumber + 1) as 2 | 3
    const nextGame = updatedGames.find(
      (item) => item.matchId === game.matchId && item.gameNumber === nextGameNumber
    )

    if (nextGame) {
      if (nextGame.status === 'NOT_STARTED') {
        nextGame.status = 'IN_PROGRESS'
        nextGame.updatedAt = updatedAt
      }
    } else {
      updatedGames.push({
        id: `${game.matchId}-game-${nextGameNumber}`,
        matchId: game.matchId,
        gameNumber: nextGameNumber,
        team1Score: 0,
        team2Score: 0,
        status: 'IN_PROGRESS',
        winner: null,
        createdAt: updatedAt,
        updatedAt,
      })
    }
  }

  currentGames = updatedGames
  currentData = updatedData
  return true
}

export function startNewGame(matchId: string, gameNumber: 1 | 2 | 3): Game | null {
  const updatedGames = cloneGames()
  const updatedData = cloneData()

  if (!findMatchInData(updatedData, matchId)) return null

  const existingGame = updatedGames.find(
    (item) => item.matchId === matchId && item.gameNumber === gameNumber
  )

  const updatedAt = touch()

  if (existingGame) {
    if (existingGame.status === 'NOT_STARTED') {
      existingGame.status = 'IN_PROGRESS'
      existingGame.updatedAt = updatedAt
      currentGames = updatedGames
    }

    syncMatchScore(updatedData, updatedGames, matchId, 'IN_PROGRESS')
    currentData = updatedData
    return existingGame
  }

  const game: Game = {
    id: `${matchId}-game-${gameNumber}`,
    matchId,
    gameNumber,
    team1Score: 0,
    team2Score: 0,
    status: 'IN_PROGRESS',
    winner: null,
    createdAt: updatedAt,
    updatedAt,
  }

  updatedGames.push(game)
  syncMatchScore(updatedData, updatedGames, matchId, 'IN_PROGRESS')
  currentGames = updatedGames
  currentData = updatedData
  return game
}

export function completeMatch(matchId: string) {
  const updatedGames = cloneGames()
  const updatedData = cloneData()
  const location = findMatchInData(updatedData, matchId)

  if (!location) return false

  const wins = countMatchWins(updatedGames, matchId)

  if (wins.team1 === 0 && wins.team2 === 0) return false

  location.match.finalScore = {
    team1: wins.team1,
    team2: wins.team2,
  }
  location.match.status = 'CONFIRMED'

  currentGames = updatedGames
  currentData = updatedData
  touch()
  return true
}

export function updateMatch(
  matchId: string,
  updates: {
    score?: { team1: number; team2: number }
    status?: TournamentMatch['status']
    courtNumber?: number
  }
) {
  const updated = cloneData()

  for (const tournament of updated) {
    for (const category of tournament.categories) {
      // Update pool matches
      for (const pool of category.pools) {
        const match = pool.matches.find((m: any) => m.id === matchId)
        if (match) {
          if (updates.score) match.finalScore = updates.score
          if (updates.status) match.status = updates.status
          if (updates.courtNumber !== undefined) match.courtNumber = updates.courtNumber
          currentData = updated
          touch()
          return true
        }
      }

      // Update playoff matches
      const playoffMatch = category.playoffMatches.find((m: any) => m.id === matchId)
      if (playoffMatch) {
        if (updates.score) playoffMatch.finalScore = updates.score
        if (updates.status) playoffMatch.status = updates.status
        if (updates.courtNumber !== undefined) playoffMatch.courtNumber = updates.courtNumber
        currentData = updated
        touch()
        return true
      }
    }
  }

  return false
}

export function updatePool(
  poolId: string,
  updates: {
    name?: string
  }
) {
  const updated = cloneData()

  for (const tournament of updated) {
    for (const category of tournament.categories) {
      const pool = category.pools.find((p: any) => p.id === poolId)
      if (pool) {
        if (updates.name !== undefined) pool.name = updates.name
        currentData = updated
        touch()
        return true
      }
    }
  }

  return false
}

export function updateTeamName(matchId: string, team: 'team1' | 'team2', newName: string) {
  const updated = cloneData()

  for (const tournament of updated) {
    for (const category of tournament.categories) {
      // Update in pool matches
      for (const pool of category.pools) {
        const match = pool.matches.find((m: any) => m.id === matchId)
        if (match) {
          match[team] = newName
          currentData = updated
          touch()
          return true
        }
      }

      // Update in playoff matches
      const playoffMatch = category.playoffMatches.find((m: any) => m.id === matchId)
      if (playoffMatch) {
        playoffMatch[team] = newName
        currentData = updated
        touch()
        return true
      }
    }
  }

  return false
}

export function addTeamToPool(poolId: string, teamName: string) {
  const updated = cloneData()

  for (const tournament of updated) {
    for (const category of tournament.categories) {
      const pool = category.pools.find((p: any) => p.id === poolId)
      if (pool) {
        // Get all existing teams in the pool
        const existingTeams = new Set<string>()
        pool.matches.forEach((match: any) => {
          existingTeams.add(match.team1)
          existingTeams.add(match.team2)
        })

        // Create matches between new team and all existing teams
        const newMatches = Array.from(existingTeams).map((existingTeam, index) => ({
          id: `${poolId}-match-${Date.now()}-${index}`,
          team1: teamName,
          team2: existingTeam,
          stage: 'POOL' as const,
          poolId: poolId,
          status: 'SCHEDULED' as const,
        }))

        pool.matches.push(...newMatches)
        currentData = updated
        touch()
        return true
      }
    }
  }

  return false
}

export function reset() {
  currentData = JSON.parse(JSON.stringify(TOURNAMENTS))
  currentGames = buildInitialGames(currentData)
  touch()
}

// Optional: Load from KV on startup (Cloudflare Pages/Workers)
// This is a no-op in dev but will work in Cloudflare production
export async function loadFromKV(kv?: KVNamespace) {
  if (!kv) return
  try {
    const stored = await kv.get(STORE_KEY, 'json')
    if (stored) {
      if (
        typeof stored === 'object' &&
        stored !== null &&
        'tournaments' in stored &&
        'games' in stored
      ) {
        currentData = (stored as { tournaments: StoreData }).tournaments
        currentGames = (stored as { games: Game[] }).games
      } else {
        currentData = stored as StoreData
        currentGames = buildInitialGames(currentData)
      }
      touch()
    }
  } catch (error) {
    console.error('Failed to load from KV:', error)
  }
}

// Optional: Save to KV after updates (Cloudflare Pages/Workers)
export async function saveToKV(kv?: KVNamespace) {
  if (!kv) return
  try {
    await kv.put(
      STORE_KEY,
      JSON.stringify({
        tournaments: currentData,
        games: currentGames,
      })
    )
  } catch (error) {
    console.error('Failed to save to KV:', error)
  }
}

// Type for Cloudflare KV namespace
interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any>
  put(key: string, value: string | ArrayBuffer | ReadableStream): Promise<void>
}
