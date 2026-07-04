import { useEffect, useState, useCallback, useRef } from 'react'
import { TournamentData } from '@/lib/tournament-data'

interface UseTournamentDataOptions {
  pollingInterval?: number // milliseconds
  refetchOnFocus?: boolean
}

/**
 * Shared hook for tournament data with automatic polling and focus refetch
 * 
 * @param options - Configuration options
 * @returns Tournament data state and refresh function
 */
export function useTournamentData(options: UseTournamentDataOptions = {}) {
  const {
    pollingInterval = 2000, // Default 2 seconds
    refetchOnFocus = true,
  } = options

  const [tournaments, setTournaments] = useState<TournamentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchTournaments = useCallback(async (skipLoading = false) => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      if (!skipLoading) {
        setLoading(true)
      }
      setError(null)

      const res = await fetch('/api/scores', {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      setTournaments(data.tournaments || [])
    } catch (err: any) {
      // Ignore abort errors
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch tournaments:', err)
        setError(err)
      }
    } finally {
      if (!skipLoading) {
        setLoading(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  // Polling interval
  useEffect(() => {
    if (pollingInterval > 0) {
      const interval = setInterval(() => {
        fetchTournaments(true) // Skip loading state for background polls
      }, pollingInterval)

      return () => clearInterval(interval)
    }
  }, [pollingInterval, fetchTournaments])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) return

    const handleFocus = () => {
      fetchTournaments(true)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, fetchTournaments])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    tournaments,
    loading,
    error,
    refresh: () => fetchTournaments(false), // Manual refresh with loading state
  }
}
