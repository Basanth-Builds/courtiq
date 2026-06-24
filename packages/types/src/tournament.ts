export type TournamentStatus = 'draft' | 'registration' | 'pool_play' | 'playoffs' | 'completed'

export interface Tournament {
  id: string
  name: string
  description?: string
  date: Date
  location: string
  status: TournamentStatus
  drawSize: number
  poolSize: number
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface Pool {
  id: string
  tournamentId: string
  name: string       // e.g. "Pool A"
  order: number
  createdAt: Date
}

export interface PoolStanding {
  poolId: string
  participantId: string
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  position: number
  advanced: boolean
}

export type BracketRound = 'quarterfinal' | 'semifinal' | 'final' | 'third_place'

export interface BracketMatch {
  id: string
  tournamentId: string
  round: BracketRound
  position: number
  team1Id?: string
  team2Id?: string
  winnerId?: string
}
