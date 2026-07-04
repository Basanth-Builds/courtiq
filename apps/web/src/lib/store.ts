// Simple store with Cloudflare KV persistence fallback
// In dev: uses in-memory store. In production: can use KV for persistence.
import { TOURNAMENTS } from './tournament-data'

type StoreData = typeof TOURNAMENTS

// Initialize with demo data
let currentData: StoreData = JSON.parse(JSON.stringify(TOURNAMENTS))

// Key for KV storage
const STORE_KEY = 'tournament_data'

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

export function updatePool(
  poolId: string,
  updates: {
    name?: string
  }
) {
  const updated = JSON.parse(JSON.stringify(currentData))

  for (const tournament of updated) {
    for (const category of tournament.categories) {
      const pool = category.pools.find((p: any) => p.id === poolId)
      if (pool) {
        if (updates.name !== undefined) pool.name = updates.name
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

// Optional: Load from KV on startup (Cloudflare Pages/Workers)
// This is a no-op in dev but will work in Cloudflare production
export async function loadFromKV(kv?: KVNamespace) {
  if (!kv) return
  try {
    const stored = await kv.get(STORE_KEY, 'json')
    if (stored) {
      currentData = stored as StoreData
    }
  } catch (error) {
    console.error('Failed to load from KV:', error)
  }
}

// Optional: Save to KV after updates (Cloudflare Pages/Workers)
export async function saveToKV(kv?: KVNamespace) {
  if (!kv) return
  try {
    await kv.put(STORE_KEY, JSON.stringify(currentData))
  } catch (error) {
    console.error('Failed to save to KV:', error)
  }
}

// Type for Cloudflare KV namespace
interface KVNamespace {
  get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any>
  put(key: string, value: string | ArrayBuffer | ReadableStream): Promise<void>
}

