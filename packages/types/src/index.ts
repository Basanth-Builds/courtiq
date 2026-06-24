// ==============================
// Court IQ — Shared Types
// ==============================

export type Role = 'admin' | 'referee' | 'umpire' | 'spectator'

export type TournamentStatus = 'draft' | 'registration' | 'pools' | 'playoffs' | 'completed'

export type MatchStatus =
  | 'scheduled'
  | 'in_progress'
  | 'pending_umpire'
  | 'pending_referee'
  | 'confirmed'
  | 'dupr_submitted'
  | 'dupr_excluded'

export type ApprovalRole = 'umpire' | 'referee'

export type DuprSubmissionStatus = 'pending' | 'submitted' | 'failed' | 'excluded'

export interface User {
  id: string
  phone: string
  name?: string
  role: Role
  duprId?: string
  createdAt: Date
}

export interface Tournament {
  id: string
  name: string
  description?: string
  status: TournamentStatus
  startDate: Date
  endDate?: Date
  location?: string
  adminId: string
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
}

export interface Division {
  id: string
  tournamentId: string
  name: string
  format: 'singles' | 'doubles' | 'mixed_doubles'
  ratingMin?: number
  ratingMax?: number
}

export interface Pool {
  id: string
  divisionId: string
  name: string
  order: number
}

export interface Participant {
  id: string
  tournamentId: string
  userId: string
  partnerId?: string
  duprRating?: number
  seed?: number
  poolId?: string
  user?: User
  partner?: User
}

export interface Match {
  id: string
  tournamentId: string
  poolId?: string
  round?: string
  courtId?: string
  status: MatchStatus
  team1Id: string
  team2Id: string
  score?: MatchScore
  umpireId?: string
  refereeId?: string
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  duprStatus: DuprSubmissionStatus
  duprEligible: boolean
  duprExcludeReason?: string
}

export interface MatchScore {
  id: string
  matchId: string
  team1Score: number
  team2Score: number
  winnerId?: string
  confirmedByUmpire: boolean
  confirmedByReferee: boolean
  confirmedAt?: Date
}

export interface Court {
  id: string
  tournamentId: string
  name: string
  number: number
  isActive: boolean
}

export interface ApprovalEvent {
  id: string
  matchId: string
  role: ApprovalRole
  userId: string
  confirmedAt: Date
  notes?: string
}

export interface DuprProfile {
  id: string
  userId: string
  duprId: string
  duprRating?: number
  lastSyncedAt?: Date
}

export interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: string
  userId: string
  payload?: Record<string, unknown>
  createdAt: Date
}

// API types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
