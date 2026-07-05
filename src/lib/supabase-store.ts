import { SupabaseClient } from '@supabase/supabase-js'
import { TournamentData, Category, Pool, TournamentMatch } from './tournament-data'

export async function getTournamentData(supabase: SupabaseClient): Promise<TournamentData[]> {
  const { data: tournaments, error: toursError } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  if (toursError) {
    console.error('Error fetching tournaments:', toursError)
    return []
  }

  if (!tournaments || tournaments.length === 0) {
    return []
  }

  const result: TournamentData[] = []

  for (const tournament of tournaments) {
    // Get categories for this tournament
    const { data: categories, error: catsError } = await supabase
      .from('categories')
      .select('*')
      .eq('tournament_id', tournament.id)

    if (catsError) {
      console.error('Error fetching categories:', catsError)
      continue
    }

    const tournamentCategories: Category[] = []

    for (const category of categories || []) {
      // Get pools for this category
      const { data: pools, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('category_id', category.id)

      if (poolsError) {
        console.error('Error fetching pools:', poolsError)
        continue
      }

      const categoryPools: Pool[] = []

      for (const pool of pools || []) {
        // Get matches for this pool
        const { data: matches, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('pool_id', pool.id)
          .order('created_at', { ascending: true })

        if (matchesError) {
          console.error('Error fetching matches:', matchesError)
          continue
        }

        const poolMatches: TournamentMatch[] = (matches || []).map((m: any) => ({
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
      const { data: playoffMatches, error: playoffError } = await supabase
        .from('matches')
        .select('*')
        .eq('category_id', category.id)
        .is('pool_id', null)
        .order('created_at', { ascending: true })

      if (playoffError) {
        console.error('Error fetching playoff matches:', playoffError)
        continue
      }

      const categoryPlayoffMatches: TournamentMatch[] = (playoffMatches || []).map((m: any) => ({
        id: m.id,
        team1: m.team1,
        team2: m.team2,
        stage: m.stage || 'PLAYOFF',
        poolId: undefined,
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
        format: category.format || 'SINGLES',
        pools: categoryPools,
        playoffMatches: categoryPlayoffMatches,
      })
    }

    result.push({
      id: tournament.id,
      slug: tournament.slug || tournament.id,
      name: tournament.name,
      venue: tournament.venue || '',
      date: tournament.date || '',
      status: tournament.status || 'ACTIVE',
      categories: tournamentCategories,
    })
  }

  return result
}

export async function updateMatch(
  supabase: SupabaseClient,
  matchId: string,
  team1Score: number,
  team2Score: number
): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update({
      team1_score: team1Score,
      team2_score: team2Score,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) {
    console.error('Error updating match:', error)
    return false
  }

  return true
}

export async function updatePool(
  supabase: SupabaseClient,
  poolId: string,
  newName: string
): Promise<boolean> {
  const { error } = await supabase
    .from('pools')
    .update({
      name: newName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poolId)

  if (error) {
    console.error('Error updating pool:', error)
    return false
  }

  return true
}

export async function updateTeamName(
  supabase: SupabaseClient,
  matchId: string,
  teamNumber: 1 | 2,
  newName: string
): Promise<boolean> {
  const field = teamNumber === 1 ? 'team1' : 'team2'

  const { error } = await supabase
    .from('matches')
    .update({
      [field]: newName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) {
    console.error('Error updating team name:', error)
    return false
  }

  return true
}

export async function addTeamToPool(
  supabase: SupabaseClient,
  poolId: string,
  categoryId: string,
  tournamentId: string,
  teamName: string
): Promise<string | null> {
  const { data: pool, error: poolError } = await supabase
    .from('pools')
    .select('*')
    .eq('id', poolId)
    .single()

  if (poolError || !pool) {
    console.error('Error fetching pool:', poolError)
    return null
  }

  const { data: existingMatches, error: matchesError } = await supabase
    .from('matches')
    .select('id')
    .eq('pool_id', poolId)

  if (matchesError) {
    console.error('Error fetching matches:', matchesError)
    return null
  }

  const matchCount = existingMatches?.length || 0

  const newMatchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const matchBody: any = {
    id: newMatchId,
    tournament_id: tournamentId,
    category_id: categoryId,
    pool_id: poolId,
    team1: teamName,
    team2: '',
    stage: 'POOL_PLAY',
    status: 'SCHEDULED',
    court_number: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error: createError } = await supabase.from('matches').insert(matchBody)

  if (createError) {
    console.error('Error creating new match:', createError)
    return null
  }

  return newMatchId
}

export async function createMatch(
  supabase: SupabaseClient,
  poolId: string | null,
  match: {
    team1: string
    team2: string
    courtNumber?: number
    status?: string
  }
): Promise<any | null> {
  // If poolId is provided, get pool info to get tournament_id and category_id
  let categoryId: string
  let tournamentId: string

  if (poolId) {
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('category_id, tournament_id')
      .eq('id', poolId)
      .single()

    if (poolError || !pool) {
      console.error('Error fetching pool:', poolError)
      return null
    }

    categoryId = pool.category_id
    tournamentId = pool.tournament_id
  } else {
    // This shouldn't happen, but safeguard
    return null
  }

  const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const matchData: any = {
    id: matchId,
    tournament_id: tournamentId,
    category_id: categoryId,
    pool_id: poolId,
    team1: match.team1,
    team2: match.team2,
    stage: 'POOL',
    status: match.status || 'SCHEDULED',
    court_number: match.courtNumber || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('matches').insert(matchData)

  if (error) {
    console.error('Error creating match:', error)
    return null
  }

  return {
    id: matchId,
    team1: match.team1,
    team2: match.team2,
    stage: 'POOL',
    poolId: poolId,
    courtNumber: match.courtNumber,
    status: match.status || 'SCHEDULED',
  }
}

export async function addPool(
  supabase: SupabaseClient,
  categoryId: string,
  tournamentId: string,
  poolName: string
): Promise<string | null> {
  const poolId = `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const { error } = await supabase.from('pools').insert({
    id: poolId,
    category_id: categoryId,
    tournament_id: tournamentId,
    name: poolName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Error adding pool:', error)
    return null
  }

  return poolId
}

export async function deleteMatch(supabase: SupabaseClient, matchId: string): Promise<boolean> {
  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (fetchError || !match) {
    console.error('Match not found:', fetchError)
    return false
  }

  const { error: deleteGamesError } = await supabase.from('games').delete().eq('match_id', matchId)

  if (deleteGamesError) {
    console.error('Error deleting games:', deleteGamesError)
    return false
  }

  const { error: deleteError } = await supabase.from('matches').delete().eq('id', matchId)

  if (deleteError) {
    console.error('Error deleting match:', deleteError)
    return false
  }

  return true
}

export async function deleteTeamFromMatch(
  supabase: SupabaseClient,
  matchId: string,
  teamNumber: 1 | 2
): Promise<boolean> {
  const field = teamNumber === 1 ? 'team1' : 'team2'
  const scoreField = teamNumber === 1 ? 'team1_score' : 'team2_score'

  const { error } = await supabase
    .from('matches')
    .update({
      [field]: '',
      [scoreField]: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) {
    console.error('Error deleting team from match:', error)
    return false
  }

  return true
}

export async function getMatchWithGames(
  supabase: SupabaseClient,
  matchId: string
): Promise<any | null> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    console.error('Error fetching match:', matchError)
    return null
  }

  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .eq('match_id', matchId)
    .order('game_number', { ascending: true })

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
    return null
  }

  return {
    ...match,
    games: games || [],
  }
}

export async function updateGameScore(
  supabase: SupabaseClient,
  gameId: string,
  team1Score: number,
  team2Score: number
): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .update({
      team1_score: team1Score,
      team2_score: team2Score,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  if (error) {
    console.error('Error updating game score:', error)
    return false
  }

  return true
}

export async function completeGame(
  supabase: SupabaseClient,
  gameId: string,
  winnerId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('games')
    .update({
      winner: winnerId,
      status: 'COMPLETED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  if (error) {
    console.error('Error completing game:', error)
    return false
  }

  return true
}

export async function startNewGame(
  supabase: SupabaseClient,
  matchId: string,
  gameNumber: number
): Promise<string | null> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    console.error('Error fetching match:', matchError)
    return null
  }

  const gameId = `game_${matchId}_${gameNumber}_${Date.now()}`

  const { error: createError } = await supabase.from('games').insert({
    id: gameId,
    match_id: matchId,
    game_number: gameNumber,
    team1_score: 0,
    team2_score: 0,
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (createError) {
    console.error('Error creating game:', createError)
    return null
  }

  return gameId
}

export async function completeMatch(
  supabase: SupabaseClient,
  matchId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update({
      status: 'COMPLETED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  if (error) {
    console.error('Error completing match:', error)
    return false
  }

  return true
}
