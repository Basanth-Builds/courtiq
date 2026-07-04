// Simple in-memory store with fallback to imported demo data
// In production, this would connect to a database
import { TOURNAMENTS } from './tournament-data'

type StoreData = typeof TOURNAMENTS

// Initialize with demo data
let currentData: StoreData = JSON.parse(JSON.stringify(TOURNAMENTS))

export function getTournamentStore() {
  return currentData
}

export function updateMatch(
  matchId: string,
  updates: {
    score?: { team1: number; team2: number }
    status?: string
    courtNumber?: number
  }
) {
  const updated = JSON.parse(JSON.stringify(currentData))

  for (const tournament of updated) {
    for (const category of tournament.categories) {
      // Update pool matches
      for (const pool of category.pools) {
        const match = pool.matches.find((m: any) => m.id === matchId)
        if (match) {
          if (updates.score) match.finalScore = updates.score
          if (updates.status) match.status = updates.status
          if (updates.courtNumber !== undefined) match.courtNumber = updates.courtNumber
          currentData = updated
          return true
        }
      }

      // Update playoff matches
      const playoffMatch = category.playoffMatches.find((m: any) => m.id === matchId)
      if (playoffMatch) {
        if (updates.score) playoffMatch.finalScore = updates.score
        if (updates.status) playoffMatch.status = updates.status
        if (updates.courtNumber !== undefined) playoffMatch.courtNumber = updates.courtNumber
        currentData = updated
        return true
      }
    }
  }

  return false
}

export function reset() {
  currentData = JSON.parse(JSON.stringify(TOURNAMENTS))
}
