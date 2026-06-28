export interface DUPRProfile {
  id: string
  userId: string
  duprId: string
  duprRating?: number
  lastSyncedAt?: Date
}

export interface DUPRSubmission {
  id: string
  matchId: string
  csvPath?: string
  status: 'pending' | 'exported' | 'submitted' | 'failed'
  attempts: number
  lastAttemptAt?: Date
  createdAt: Date
}

// DUPR-compatible CSV row format
export interface DUPRCsvRow {
  matchDate: string        // YYYY-MM-DD
  player1DuprId: string
  player2DuprId: string
  player3DuprId?: string   // doubles partner
  player4DuprId?: string   // opponent doubles partner
  team1Score: number
  team2Score: number
  matchFormat: 'singles' | 'doubles'
}
