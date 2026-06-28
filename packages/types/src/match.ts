export type MatchStatus =
  | 'scheduled'
  | 'in_progress'
  | 'provisional'   // umpire submitted, referee not yet confirmed
  | 'confirmed'     // referee confirmed
  | 'disputed'
  | 'cancelled'

export interface Match {
  id: string
  tournamentId: string
  poolId?: string
  courtNumber?: number
  team1Id: string
  team2Id: string
  status: MatchStatus
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface MatchScore {
  id: string
  matchId: string
  team1Score: number
  team2Score: number
  submittedById: string   // umpire user id
  confirmedById?: string  // referee user id
  submittedAt: Date
  confirmedAt?: Date
  duprEligible: boolean
  duprSubmitted: boolean
  duprSubmittedAt?: Date
}

export interface ApprovalEvent {
  id: string
  matchId: string
  action: 'submitted' | 'confirmed' | 'rejected' | 'overridden'
  actorId: string
  reason?: string
  createdAt: Date
}
