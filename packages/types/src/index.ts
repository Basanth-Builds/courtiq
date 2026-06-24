// ============================================================
// Court IQ — Shared TypeScript Types
// API contracts, DTOs, and shared interfaces
// ============================================================

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  hasMore: boolean
}

// --- Auth ---
export interface AuthUser {
  id: string
  phone: string
  name?: string
  role: 'ADMIN' | 'REFEREE' | 'UMPIRE' | 'SPECTATOR'
  duprId?: string
  duprRating?: number
}

// --- Tournament DTOs ---
export interface CreateTournamentDto {
  name: string
  format: 'SINGLES' | 'DOUBLES' | 'MIXED_DOUBLES'
  venue: string
  city?: string
  date: string // ISO date string
  poolCount: number
  advancersPerPool: number
  bracketSize: 4 | 8 | 16
  description?: string
}

export interface TournamentSummary {
  id: string
  name: string
  slug: string
  status: string
  format: string
  venue: string
  city?: string
  date: string
  teamCount: number
  matchCount: number
}

// --- Match DTOs ---
export interface SubmitScoreDto {
  matchId: string
  team1Points: number
  team2Points: number
  isComplete: boolean
}

export interface ApproveMatchDto {
  matchId: string
  note?: string
}

export interface RejectMatchDto {
  matchId: string
  note: string
}

// --- Real-time Events ---
export type RealtimeEvent =
  | { type: 'SCORE_UPDATED'; matchId: string; team1Points: number; team2Points: number }
  | { type: 'MATCH_CONFIRMED'; matchId: string }
  | { type: 'MATCH_DISPUTED'; matchId: string }
  | { type: 'TOURNAMENT_STATUS_CHANGED'; tournamentId: string; status: string }
  | { type: 'POOL_STAGE_COMPLETE'; tournamentId: string }

// --- DUPR ---
export interface DuprExportSummary {
  id: string
  tournamentId: string
  matchCount: number
  excludedCount: number
  status: 'PENDING' | 'SUBMITTED' | 'FAILED' | 'CANCELLED'
  exportedAt: string
  submittedAt?: string
}
