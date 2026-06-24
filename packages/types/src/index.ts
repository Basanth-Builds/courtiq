// ─── Roles ───────────────────────────────────────────────────────────────────
export type Role = 'admin' | 'referee' | 'umpire' | 'spectator'

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  phone: string
  name: string
  role: Role
  duprId?: string
  duprRating?: number
  createdAt: Date
}

// ─── Tournament ───────────────────────────────────────────────────────────────
export type TournamentStatus = 'draft' | 'registration' | 'pool_play' | 'playoffs' | 'completed'
export type TournamentFormat = 'singles' | 'doubles' | 'mixed_doubles'

export interface Tournament {
  id: string
  name: string
  slug: string
  status: TournamentStatus
  format: TournamentFormat
  startDate: Date
  endDate: Date
  location: string
  pools: Pool[]
  createdBy: string
}

// ─── Pool ────────────────────────────────────────────────────────────────────
export interface Pool {
  id: string
  name: string          // e.g. "Pool A"
  tournamentId: string
  teams: Team[]
  matches: Match[]
  standings: Standing[]
}

// ─── Team / Player ───────────────────────────────────────────────────────────
export interface Team {
  id: string
  name: string
  players: User[]
  seed: number
  duprRating: number
  poolId?: string
}

// ─── Match ───────────────────────────────────────────────────────────────────
export type MatchStatus = 'scheduled' | 'in_progress' | 'provisional' | 'confirmed' | 'disputed'
export type MatchPhase = 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place'

export interface Match {
  id: string
  tournamentId: string
  poolId?: string
  phase: MatchPhase
  status: MatchStatus
  courtId: string
  teamA: Team
  teamB: Team
  score?: MatchScore
  umpireId?: string
  refereeId?: string
  umpireConfirmedAt?: Date
  refereeConfirmedAt?: Date
  duprSubmitted?: boolean
  duprSubmittedAt?: Date
  scheduledAt: Date
  completedAt?: Date
}

// ─── Score ───────────────────────────────────────────────────────────────────
export interface MatchScore {
  teamAPoints: number
  teamBPoints: number
  games: GameScore[]
  winner?: 'teamA' | 'teamB'
}

export interface GameScore {
  gameNumber: number
  teamAPoints: number
  teamBPoints: number
}

// ─── Standing ────────────────────────────────────────────────────────────────
export interface Standing {
  rank: number
  team: Team
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  gamesPlayed: number
}

// ─── Court ───────────────────────────────────────────────────────────────────
export interface Court {
  id: string
  name: string          // e.g. "Court 1"
  currentMatchId?: string
  status: 'available' | 'in_use' | 'maintenance'
}

// ─── Approval ────────────────────────────────────────────────────────────────
export interface ApprovalEvent {
  id: string
  matchId: string
  userId: string
  role: 'umpire' | 'referee'
  action: 'confirmed' | 'disputed'
  notes?: string
  createdAt: Date
}

// ─── DUPR ────────────────────────────────────────────────────────────────────
export interface DUPRRow {
  Player1_DUPR_ID: string
  Player2_DUPR_ID: string
  Opponent1_DUPR_ID: string
  Opponent2_DUPR_ID: string
  Player1_Score: number
  Opponent1_Score: number
  Match_Date: string
  Location: string
  Format: 'singles' | 'doubles'
}
