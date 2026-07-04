// D1 Database Store for production
// This file provides database access functions for Cloudflare D1

import { TournamentData, Category, Pool, TournamentMatch } from './tournament-data'

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  all<T = unknown>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}

export interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  meta: {
    duration: number
    rows_read: number
    rows_written: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// ─── Get all tournament data ────────────────────────────────────────────────
export async function getTournamentData(db: D1Database): Promise<TournamentData[]> {
  // Get tournaments
  const tournaments = await db
    .prepare('SELECT * FROM tournaments ORDER BY created_at DESC')
    .all<any>()

  if (!tournaments.results || tournaments.results.length === 0) {
    return []
  }

  const result: TournamentData[] = []

  for (const tournament of tournaments.results) {
    // Get categories for this tournament
    const categories = await db
      .prepare('SELECT * FROM categories WHERE tournament_id = ?')
      .bind(tournament.id)
      .all<any>()

    const tournamentCategories: Category[] = []

    for (const category of categories.results || []) {
      // Get pools for this category
      const pools = await db
        .prepare('SELECT * FROM pools WHERE category_id = ?')
        .bind(category.id)
        .all<any>()

      const categoryPools: Pool[] = []

      for (const pool of pools.results || []) {
        // Get matches for this pool
        const matches = await db
          .prepare('SELECT * FROM matches WHERE pool_id = ? ORDER BY created_at')
          .bind(pool.id)
          .all<any>()

        const poolMatches: TournamentMatch[] = (matches.results || []).map((m: any) => ({
          id: m.id,
          team1: m.team1,
          team2: m.team2,
          stage: m.stage,
          poolId: m.pool_id,
          courtNumber: m.court_number || undefined,
          status: m.status,
          finalScore:
            m.team1_score !== null && m.team2_score !== null
              ? { team1: m.team1_score, team2: m.team2_score }
              : undefined,
        }))

        categoryPools.push({
          id: pool.id,
          name: pool.name,
          categoryId: category.id,
          matches: poolMatches,
        })
      }

      // Get playoff matches for this category
      const playoffMatches = await db
        .prepare('SELECT * FROM matches WHERE category_id = ? AND pool_id IS NULL ORDER BY created_at')
        .bind(category.id)
        .all<any>()

      const categoryPlayoffMatches: TournamentMatch[] = (playoffMatches.results || []).map((m: any) => ({
        id: m.id,
        team1: m.team1,
        team2: m.team2,
        stage: m.stage,
        courtNumber: m.court_number || undefined,
        status: m.status,
        finalScore:
          m.team1_score !== null && m.team2_score !== null
            ? { team1: m.team1_score, team2: m.team2_score }
            : undefined,
      }))

      tournamentCategories.push({
        id: category.id,
        name: category.name,
        format: category.format,
        pools: categoryPools,
        playoffMatches: categoryPlayoffMatches,
      })
    }

    result.push({
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      venue: tournament.venue,
      date: tournament.date,
      status: tournament.status,
      categories: tournamentCategories,
    })
  }

  return result
}

// ─── Update match ───────────────────────────────────────────────────────────
export async function updateMatch(
  db: D1Database,
  matchId: string,
  updates: {
    score?: { team1: number; team2: number }
    status?: string
    courtNumber?: number
  }
): Promise<boolean> {
  const sets: string[] = []
  const bindings: any[] = []

  if (updates.score) {
    sets.push('team1_score = ?', 'team2_score = ?')
    bindings.push(updates.score.team1, updates.score.team2)
  }

  if (updates.status) {
    sets.push('status = ?')
    bindings.push(updates.status)
  }

  if (updates.courtNumber !== undefined) {
    sets.push('court_number = ?')
    bindings.push(updates.courtNumber || null)
  }

  if (sets.length === 0) return false

  sets.push('updated_at = CURRENT_TIMESTAMP')

  const query = `UPDATE matches SET ${sets.join(', ')} WHERE id = ?`
  bindings.push(matchId)

  const result = await db.prepare(query).bind(...bindings).run()

  return result.success
}

// ─── Update pool name ───────────────────────────────────────────────────────
export async function updatePool(
  db: D1Database,
  poolId: string,
  updates: { name?: string }
): Promise<boolean> {
  if (!updates.name) return false

  const result = await db
    .prepare('UPDATE pools SET name = ? WHERE id = ?')
    .bind(updates.name, poolId)
    .run()

  return result.success
}

// ─── Update team name ───────────────────────────────────────────────────────
export async function updateTeamName(
  db: D1Database,
  matchId: string,
  team: 'team1' | 'team2',
  newName: string
): Promise<boolean> {
  const column = team === 'team1' ? 'team1' : 'team2'
  const query = `UPDATE matches SET ${column} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

  const result = await db.prepare(query).bind(newName, matchId).run()

  return result.success
}

// ─── Add team to pool ───────────────────────────────────────────────────────
export async function addTeamToPool(
  db: D1Database,
  poolId: string,
  teamName: string
): Promise<boolean> {
  // Get pool info
  const pool = await db.prepare('SELECT * FROM pools WHERE id = ?').bind(poolId).first<any>()

  if (!pool) return false

  // Get existing teams in the pool
  const existingMatches = await db
    .prepare('SELECT DISTINCT team1, team2 FROM matches WHERE pool_id = ?')
    .bind(poolId)
    .all<any>()

  const teams = new Set<string>()
  for (const match of existingMatches.results || []) {
    teams.add(match.team1)
    teams.add(match.team2)
  }

  // Get tournament_id and category_id from an existing match
  const sampleMatch = await db
    .prepare('SELECT tournament_id, category_id FROM matches WHERE pool_id = ? LIMIT 1')
    .bind(poolId)
    .first<any>()

  if (!sampleMatch) return false

  // Create matches against all existing teams
  const statements: D1PreparedStatement[] = []
  const timestamp = Date.now()

  Array.from(teams).forEach((existingTeam, index) => {
    const matchId = `${poolId}-match-${timestamp}-${index}`
    statements.push(
      db
        .prepare(
          'INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          matchId,
          sampleMatch.tournament_id,
          sampleMatch.category_id,
          poolId,
          teamName,
          existingTeam,
          'POOL',
          'SCHEDULED'
        )
    )
  })

  if (statements.length > 0) {
    await db.batch(statements)
  }

  return true
}

// ─── Create match ───────────────────────────────────────────────────────────
export async function createMatch(
  db: D1Database,
  poolId: string,
  match: {
    team1: string
    team2: string
    courtNumber?: number
    status?: string
  }
): Promise<TournamentMatch | null> {
  // Get pool info
  const pool = await db.prepare('SELECT * FROM pools WHERE id = ?').bind(poolId).first<any>()

  if (!pool) return null

  // Get tournament_id and category_id from pool
  const matchId = `${poolId}-match-${Date.now()}`

  const result = await db
    .prepare(
      'INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, court_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      matchId,
      pool.tournament_id,
      pool.category_id,
      poolId,
      match.team1,
      match.team2,
      'POOL',
      match.status || 'SCHEDULED',
      match.courtNumber || null
    )
    .run()

  if (!result.success) return null

  return {
    id: matchId,
    team1: match.team1,
    team2: match.team2,
    stage: 'POOL',
    poolId: poolId,
    courtNumber: match.courtNumber,
    status: (match.status as any) || 'SCHEDULED',
  }
}

// ─── Add pool ───────────────────────────────────────────────────────────────
export async function addPool(
  db: D1Database,
  categoryId: string,
  poolName: string
): Promise<Pool | null> {
  // Get category info
  const category = await db
    .prepare('SELECT * FROM categories WHERE id = ?')
    .bind(categoryId)
    .first<any>()

  if (!category) return null

  const poolId = `${categoryId}-pool-${Date.now()}`

  const result = await db
    .prepare('INSERT INTO pools (id, category_id, tournament_id, name) VALUES (?, ?, ?, ?)')
    .bind(poolId, categoryId, category.tournament_id, poolName)
    .run()

  if (!result.success) return null

  return {
    id: poolId,
    name: poolName,
    categoryId: categoryId,
    matches: [],
  }
}

