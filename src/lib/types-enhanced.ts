// Enhanced types for complete pickleball tournament system
// Extends tournament-data.ts with games, courts, brackets, and schedules

export interface Game {
  id: string
  matchId: string
  gameNumber: 1 | 2 | 3
  team1Score: number
  team2Score: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  winner: 'team1' | 'team2' | null
  createdAt: string
  updatedAt: string
}

export interface Court {
  id: string
  tournamentId: string
  courtNumber: number
  name: string
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'
  currentMatchId: string | null
  createdAt: string
  updatedAt: string
}

export interface ScheduleSlot {
  id: string
  tournamentId: string
  matchId: string | null
  courtId: string
  startTime: string  // ISO 8601
  endTime: string | null
  durationMinutes: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface Player {
  id: string
  tournamentId: string
  name: string
  categoryId: string
  poolId: string | null
  seed: number | null
  email: string | null
  phone: string | null
  createdAt: string
}

export interface PlayerStats {
  id: string
  playerId: string
  tournamentId: string
  categoryId: string
  matchesPlayed: number
  matchesWon: number
  gamesPlayed: number
  gamesWon: number
  pointsFor: number
  pointsAgainst: number
  updatedAt: string
}

export interface Bracket {
  id: string
  tournamentId: string
  categoryId: string
  bracketType: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'CONSOLATION'
  round: 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL' | 'THIRD_PLACE'
  position: number
  matchId: string | null
  seed1: number | null
  seed2: number | null
  createdAt: string
}

// Enhanced match with games
export interface MatchWithGames {
  id: string
  tournamentId: string
  categoryId: string
  poolId: string | null
  team1: string
  team2: string
  stage: string
  status: string
  team1Score: number | null
  team2Score: number | null
  courtNumber: number | null
  createdAt: string
  updatedAt: string
  games: Game[]
  court?: Court
  scheduleSlot?: ScheduleSlot
}

// Court board entry (for display)
export interface CourtBoardEntry {
  court: Court
  currentMatch?: {
    id: string
    team1: string
    team2: string
    stage: string
    categoryName: string
    games: Game[]
  } | null
}

// Live match info
export interface LiveMatch {
  match: MatchWithGames
  categoryName: string
  categoryFormat: string
  poolName: string | null
  courtNumber: number | null
  startTime: string | null
}
