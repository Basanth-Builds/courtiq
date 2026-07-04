// Typed data module for public tournament viewing (minimal release)
// Replace with DB queries once the backend is wired.

export interface FinalScore {
  team1: number
  team2: number
}

export interface TournamentMatch {
  id: string
  team1: string
  team2: string
  stage: 'POOL' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL' | 'THIRD_PLACE'
  poolId?: string
  courtNumber?: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CONFIRMED'
  finalScore?: FinalScore
}

export interface Pool {
  id: string
  name: string
  categoryId: string
  matches: TournamentMatch[]
}

export interface Category {
  id: string
  name: string
  format: 'SINGLES' | 'DOUBLES' | 'MIXED_DOUBLES'
  pools: Pool[]
  playoffMatches: TournamentMatch[]
}

export interface TournamentData {
  id: string
  slug: string
  name: string
  venue: string
  date: string
  status: 'DRAFT' | 'REGISTRATION' | 'ACTIVE' | 'COMPLETED'
  categories: Category[]
}

// ─── Demo data ──────────────────────────────────────────────────────────────
// Swap this out for a real DB call when ready.

const DEMO_TOURNAMENT: TournamentData = {
  id: 'trn_demo',
  slug: 'summer-open-2025',
  name: 'Summer Open 2025',
  venue: 'Pickleball Park — Austin, TX',
  date: '2025-08-02',
  status: 'COMPLETED',
  categories: [
    {
      id: 'cat_md35',
      name: 'Open Singles',
      format: 'SINGLES',
      pools: [
        {
          id: 'pool_md35_a',
          name: 'Pool A',
          categoryId: 'cat_md35',
          matches: [
            {
              id: 'm1',
              team1: 'Smith / Jones',
              team2: 'Lee / Park',
              stage: 'POOL',
              poolId: 'pool_md35_a',
              courtNumber: 1,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 7 },
            },
            {
              id: 'm2',
              team1: 'Smith / Jones',
              team2: 'Kim / Patel',
              stage: 'POOL',
              poolId: 'pool_md35_a',
              courtNumber: 1,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 4 },
            },
            {
              id: 'm3',
              team1: 'Lee / Park',
              team2: 'Kim / Patel',
              stage: 'POOL',
              poolId: 'pool_md35_a',
              courtNumber: 2,
              status: 'CONFIRMED',
              finalScore: { team1: 9, team2: 11 },
            },
          ],
        },
        {
          id: 'pool_md35_b',
          name: 'Pool B',
          categoryId: 'cat_md35',
          matches: [
            {
              id: 'm4',
              team1: 'Wang / Diaz',
              team2: 'Brown / Hall',
              stage: 'POOL',
              poolId: 'pool_md35_b',
              courtNumber: 3,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 8 },
            },
            {
              id: 'm5',
              team1: 'Wang / Diaz',
              team2: 'Chen / Scott',
              stage: 'POOL',
              poolId: 'pool_md35_b',
              courtNumber: 3,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 6 },
            },
            {
              id: 'm6',
              team1: 'Brown / Hall',
              team2: 'Chen / Scott',
              stage: 'POOL',
              poolId: 'pool_md35_b',
              courtNumber: 4,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 9 },
            },
          ],
        },
      ],
      playoffMatches: [
        {
          id: 'm7',
          team1: 'Smith / Jones',
          team2: 'Wang / Diaz',
          stage: 'FINAL',
          courtNumber: 1,
          status: 'CONFIRMED',
          finalScore: { team1: 11, team2: 9 },
        },
        {
          id: 'm8',
          team1: 'Kim / Patel',
          team2: 'Brown / Hall',
          stage: 'THIRD_PLACE',
          courtNumber: 2,
          status: 'CONFIRMED',
          finalScore: { team1: 11, team2: 8 },
        },
      ],
    },
    {
      id: 'cat_wd35',
      name: 'Open Doubles',
      format: 'DOUBLES',
      pools: [
        {
          id: 'pool_wd35_a',
          name: 'Pool A',
          categoryId: 'cat_wd35',
          matches: [
            {
              id: 'm9',
              team1: 'Davis / Miller',
              team2: 'Wilson / Moore',
              stage: 'POOL',
              poolId: 'pool_wd35_a',
              courtNumber: 5,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 5 },
            },
            {
              id: 'm10',
              team1: 'Davis / Miller',
              team2: 'Taylor / Anderson',
              stage: 'POOL',
              poolId: 'pool_wd35_a',
              courtNumber: 5,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 3 },
            },
            {
              id: 'm11',
              team1: 'Wilson / Moore',
              team2: 'Taylor / Anderson',
              stage: 'POOL',
              poolId: 'pool_wd35_a',
              courtNumber: 6,
              status: 'CONFIRMED',
              finalScore: { team1: 8, team2: 11 },
            },
          ],
        },
      ],
      playoffMatches: [
        {
          id: 'm12',
          team1: 'Davis / Miller',
          team2: 'Taylor / Anderson',
          stage: 'FINAL',
          courtNumber: 1,
          status: 'CONFIRMED',
          finalScore: { team1: 11, team2: 6 },
        },
      ],
    },
    {
      id: 'cat_mx40',
      name: 'Open Doubles 3.8',
      format: 'DOUBLES',
      pools: [
        {
          id: 'pool_mx40_a',
          name: 'Pool A',
          categoryId: 'cat_mx40',
          matches: [
            {
              id: 'm13',
              team1: 'Roberts / Clark',
              team2: 'Lewis / Walker',
              stage: 'POOL',
              poolId: 'pool_mx40_a',
              courtNumber: 7,
              status: 'CONFIRMED',
              finalScore: { team1: 11, team2: 7 },
            },
          ],
        },
      ],
      playoffMatches: [
        {
          id: 'm14',
          team1: 'Roberts / Clark',
          team2: 'Lewis / Walker',
          stage: 'FINAL',
          courtNumber: 1,
          status: 'CONFIRMED',
          finalScore: { team1: 11, team2: 8 },
        },
      ],
    },
  ],
}

export const TOURNAMENTS: TournamentData[] = [DEMO_TOURNAMENT]

export function getTournamentBySlug(slug: string): TournamentData | undefined {
  return TOURNAMENTS.find((t) => t.slug === slug)
}
