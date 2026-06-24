// ============================================================
// Court IQ — Shared Core Types
// ============================================================

export type Role = 'admin' | 'referee' | 'umpire' | 'spectator'

export type TournamentFormat = 'round_robin' | 'single_elimination' | 'double_elimination'
export type TournamentStatus = 'draft' | 'registration' | 'active' | 'completed' | 'cancelled'
export type MatchStatus = 'scheduled' | 'in_progress' | 'pending_review' | 'confirmed' | 'disputed'
export type PoolStage = 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place'
export type ApprovalStatus = 'pending_umpire' | 'pending_referee' | 'approved' | 'rejected'

export interface Player {
  id: string
  name: string
  phone: string
  duprId?: string
  duprRating?: number
  gender?: 'male' | 'female' | 'mixed'
}

export interface Team {
  id: string
  name: string
  players: Player[]
  duprRating?: number // avg of players for doubles
}

export interface Pool {
  id: string
  name: string // e.g. "Pool A"
  teams: Team[]
  matches: Match[]
}

export interface MatchScore {
  team1Points: number
  team2Points: number
  isComplete: boolean
}

export interface Match {
  id: string
  tournamentId: string
  poolId?: string
  stage: PoolStage
  team1: Team
  team2: Team
  score?: MatchScore
  status: MatchStatus
  approvalStatus: ApprovalStatus
  courtNumber?: number
  scheduledAt?: Date
  completedAt?: Date
  umpireId?: string
  refereeId?: string
  duprSubmitted?: boolean
  duprEligible?: boolean
  duprExclusionReason?: string
}

export interface PoolStanding {
  team: Team
  matchesPlayed: number
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
  rank: number
}

export interface BracketSlot {
  id: string
  round: PoolStage
  position: number // 1-indexed slot in bracket
  team?: Team
  matchId?: string
  advancesTo?: string // next BracketSlot id
}

export interface DUPRMatchRow {
  playerOneDUPRId: string
  playerOneName: string
  playerTwoDUPRId?: string // doubles only
  playerTwoName?: string
  opponentOneDUPRId: string
  opponentOneName: string
  opponentTwoDUPRId?: string
  opponentTwoName?: string
  winnerScore: number
  loserScore: number
  matchDate: string // YYYY-MM-DD
  format: 'singles' | 'doubles'
  tournamentName: string
}
