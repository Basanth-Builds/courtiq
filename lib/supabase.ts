import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { getSupabaseEnv } from './supabase-config'

// Client-side Supabase client - reads env vars at runtime (browser)
export const createClientComponentClient = () => {
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Route handler client - reads env vars at build time (server)
export const createRouteHandlerClient = (request: Request) => {
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseEnv()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get('cookie')
        if (!cookieHeader) return []

        return cookieHeader.split(';').map(cookie => {
          const [name, ...rest] = cookie.trim().split('=')
          const value = rest.join('=')
          return { name, value }
        })
      },
      setAll(_cookiesToSet) {
        // In route handlers, we can't set cookies directly
        // The cookies will be set by the response
      },
    },
  })
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          role: 'referee' | 'organizer' | 'player' | 'audience'
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          role: 'referee' | 'organizer' | 'player' | 'audience'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          role?: 'referee' | 'organizer' | 'player' | 'audience'
          created_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          location: string | null
          date_start: string
          date_end: string
          organizer: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          date_start: string
          date_end: string
          organizer: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          date_start?: string
          date_end?: string
          organizer?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          team1_players: string[]
          team2_players: string[]
          referee: string | null
          scheduled_at: string
          status: 'scheduled' | 'live' | 'completed'
          score_team1: number
          score_team2: number
          current_game: number
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team1_players: string[]
          team2_players: string[]
          referee?: string | null
          scheduled_at: string
          status?: 'scheduled' | 'live' | 'completed'
          score_team1?: number
          score_team2?: number
          current_game?: number
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team1_players?: string[]
          team2_players?: string[]
          referee?: string | null
          scheduled_at?: string
          status?: 'scheduled' | 'live' | 'completed'
          score_team1?: number
          score_team2?: number
          current_game?: number
          created_at?: string
        }
      }
      points: {
        Row: {
          id: string
          match_id: string
          scoring_team: number
          timestamp: string
        }
        Insert: {
          id?: string
          match_id: string
          scoring_team: number
          timestamp?: string
        }
        Update: {
          id?: string
          match_id?: string
          scoring_team?: number
          timestamp?: string
        }
      }
    }
  }
}