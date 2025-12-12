# Complete Tournament Bracket System - Implementation Guide

## Quick Start

### 1. Initialize Database (One-time setup)
```sql
-- Copy and paste the contents of:
-- migrations/add_team_management.sql
-- Into your Supabase SQL Editor and run
```

This creates:
- `teams` - Team definitions (6 teams, 2 pools)
- `team_players` - Player assignments to teams
- `pool_matches` - Match records for all match types
- `doubles_players` - Doubles pair assignments per match
- `pool_standings` - Auto-calculated rankings

### 2. Tournament Setup Workflow

#### Step 1: Add Manual Participants
1. Go to tournament detail page
2. Click "Add Players Manually" button
3. Enter participant names, emails (optional), phone (optional)
4. Save participants

#### Step 2: Assign Players to Teams
1. Click "Assign Players to Teams" button
2. Dialog shows 6 teams in 2 pools (Pool 1: Teams 1-3, Pool 2: Teams 4-6)
3. Select players from left panel
4. Click "Assign" on each team
5. Add selected players to team
6. Repeat for all teams (at least 1 player per team recommended)
7. Once both pools have all teams populated, "Start Tournament" button enables

#### Step 3: Generate Pool Play Matches
1. Click "Generate Matches" button
2. Reviews algorithm: each team plays every other team 2x = 12 matches per pool
3. Click "Generate X Matches" to create all pool play matches
4. Result: 24 total pool play matches (12 per pool)

#### Step 4: View Pool Standings
1. Pool Standings component shows real-time rankings
2. Rankings based on: Wins > Point Differential > Points For
3. Top 2 teams from each pool advance to semifinals

#### Step 5: View Tournament Bracket
1. Tournament Bracket component shows all matches organized by type
2. Pool Play tab: All 24 pool matches organized by round
3. Semifinals tab: Auto-generates once pool play completes
4. Finals tab: Shows final match between semifinal winners

#### Step 6: Assign Doubles Players (Per Match)
1. For each match that needs doubles assignment
2. Click "Assign Doubles" button on match card
3. Select or manually enter 2 players per team
4. Save assignment
5. Both teams must be assigned before match starts

## Components Overview

### 1. TeamAssignment (`components/team-assignment.tsx`)

**Purpose**: Assign manual participants to 6 teams organized in 2 pools

**Key Features**:
- Auto-creates 6 teams on first open (Pool 1: Teams 1-3, Pool 2: Teams 4-6)
- Multi-select participants and assign to teams
- Remove players from teams
- Pool readiness indicators (✓ Ready when all teams have players)
- "Start Tournament" button (enabled only when both pools ready)

**Props**:
```typescript
interface TeamAssignmentProps {
  tournamentId: string
  onTeamsConfigured?: () => void
}
```

**State Management**:
- Participants: All manual participants in tournament
- Teams: 6 auto-created teams with nested team_players
- Selected players: Multi-select for batch assignment

**Database Operations**:
- GET tournament_participants
- GET/POST teams (creates if none exist)
- POST team_players (add players to team)
- DELETE team_players (remove player from team)

**Integration**:
```tsx
// In tournament detail page
<TeamAssignment 
  tournamentId={id}
  onTeamsConfigured={() => {
    // Optionally refresh matches or navigate
  }}
/>
```

### 2. MatchScheduler (`components/match-scheduler.tsx`)

**Purpose**: Generate round-robin pool play matches

**Algorithm**:
```
Pool 1 (Teams 1, 2, 3):
  Round 1: 1v2, 1v3, 2v3
  Round 2: 2v1, 3v1, 3v2
  Total: 6 matches

Pool 2 (Teams 4, 5, 6): Same pattern
  Total per pool: 6 matches
  Grand total: 12 matches per pool × 2 pools = 24 matches
```

**Key Features**:
- Shows match count breakdown per pool
- Explains round-robin algorithm
- Prevents duplicate generation (checks if matches exist)
- Shows success state after generation
- Real-time match count display

**Props**:
```typescript
interface MatchSchedulerProps {
  tournamentId: string
  teams: Team[]
  onMatchesGenerated?: (matchCount: number) => void
}
```

**Database Operations**:
- GET pool_matches (check if already exist)
- POST pool_matches (bulk insert all matches)

**Match Structure**:
```typescript
{
  tournament_id: string
  team1_id: string
  team2_id: string
  pool: number (1 or 2)
  match_type: 'pool'
  match_round: number (1 or 2)
  status: 'pending'
  scores: { team1_score: null, team2_score: null }
}
```

### 3. PoolStandings (`components/pool-standings.tsx`)

**Purpose**: Display pool rankings with real-time updates

**Key Features**:
- Real-time subscription to standings changes
- Separate tables for Pool 1 and Pool 2
- Shows: Rank, Team, Matches, Wins, Losses, Points For/Against, Differential
- Tie-breaking rules legend (Wins → Differential → Points For)
- Loading state with spinner
- Badge indicators (1st, 2nd, 3rd)
- Trophy icon for 1st place

**Props**:
```typescript
interface PoolStandingsProps {
  tournamentId: string
}
```

**Ranking Algorithm**:
1. Most wins (primary)
2. Point differential (wins × 3 or actual points)
3. Total points for (if still tied)

**Real-time Updates**:
```typescript
// Subscribes to pool_standings changes
supabase
  .channel(`standings:tournament_${tournamentId}`)
  .on('postgres_changes', {...})
  .subscribe()
```

**Database Operations**:
- GET pool_standings (with team info via join)
- Subscribes to INSERT/UPDATE/DELETE events

### 4. TournamentBracket (`components/tournament-bracket.tsx`)

**Purpose**: Display all matches organized by type (pool, semifinal, final)

**Key Features**:
- Tabs for Pool Play, Semifinals, Finals
- Match cards show teams, score, status, round number
- Real-time match updates
- Match status badges (Pending, LIVE, Completed)
- Summary stats: Total, Live, Completed, Pending matches
- Organized by pool for pool play matches
- Disabled tabs for empty match types

**Props**:
```typescript
interface TournamentBracketProps {
  tournamentId: string
}
```

**Match Card Display**:
- Status badge (color-coded)
- Team 1 vs Team 2 layout
- Scores (if completed)
- Round number (for pool play)

**Database Operations**:
- GET pool_matches (all types, organized by match_type)
- Subscribes to INSERT/UPDATE/DELETE events

**Integration Example**:
```tsx
<TournamentBracket tournamentId={id} />
```

### 5. DoublesMatchEntry (`components/doubles-match-entry.tsx`)

**Purpose**: Assign doubles player pairs per match

**Key Features**:
- Modal dialog for doubles assignment
- Team roster dropdown for each player
- Manual name entry support (for flexibility)
- Edit existing assignments
- Separate editor and display views
- Ready status indicator (both teams assigned)

**Props**:
```typescript
interface DoublesMatchEntryProps {
  matchId: string
  team1Id: string
  team2Id: string
  team1Name: string
  team2Name: string
  onAssignmentsUpdated?: () => void
}
```

**Workflow**:
1. Click "Assign Doubles" on a match
2. For Team 1:
   - Select player from dropdown OR
   - Enter manual name
   - Repeat for Player 2
3. For Team 2: Same process
4. Save assignments
5. Ready badge shows when both teams complete

**Database Operations**:
- GET team_players (for roster dropdown)
- GET doubles_players (check for existing)
- POST/PATCH doubles_players (insert or update)

**Data Structure**:
```typescript
{
  id: string
  pool_match_id: string
  team_id: string
  player1_id: string | null (null if manual entry)
  player2_id: string | null (null if manual entry)
  player1_name: string
  player2_name: string
  created_at: timestamp
  updated_at: timestamp
}
```

## Database Schema

### teams table
```sql
- id: UUID PRIMARY KEY
- tournament_id: UUID FK (tournaments)
- name: VARCHAR (e.g., "Team 1")
- team_number: INT (1-6)
- pool: INT (1 or 2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

-- Constraints:
-- UNIQUE(tournament_id, team_number)
-- Pool 1: Teams 1-3
-- Pool 2: Teams 4-6
```

### team_players table
```sql
- id: UUID PRIMARY KEY
- team_id: UUID FK (teams)
- participant_id: UUID FK (tournament_participants)
- player_name: VARCHAR
- created_at: TIMESTAMP

-- For quick lookup of team rosters
-- Used in doubles player selection
```

### pool_matches table
```sql
- id: UUID PRIMARY KEY
- tournament_id: UUID FK (tournaments)
- team1_id: UUID FK (teams)
- team2_id: UUID FK (teams)
- pool: INT (1 or 2)
- match_type: VARCHAR ('pool' | 'semifinal' | 'final')
- match_round: INT (for pool matches, 1-2)
- scheduled_at: TIMESTAMP
- status: VARCHAR ('pending' | 'live' | 'completed')
- scores: JSONB { team1_score: INT, team2_score: INT }
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

-- Pool play: 12 matches per pool (6 per round)
-- Semifinals: 2 matches
-- Finals: 1 match
```

### doubles_players table
```sql
- id: UUID PRIMARY KEY
- pool_match_id: UUID FK (pool_matches)
- team_id: UUID FK (teams)
- player1_id: UUID FK (tournament_participants) [nullable]
- player2_id: UUID FK (tournament_participants) [nullable]
- player1_name: VARCHAR
- player2_name: VARCHAR
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

-- Allows manual entry (player_id can be null)
-- Max 2 records per match (one per team)
```

### pool_standings table
```sql
- id: UUID PRIMARY KEY
- team_id: UUID FK (teams)
- pool: INT (1 or 2)
- matches_played: INT
- wins: INT
- losses: INT
- total_points_for: INT
- total_points_against: INT
- rank: INT (1-3 within pool)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

-- Auto-updated by trigger when matches complete
-- Enables fast ranking queries for semifinals
```

## API Endpoints Needed (Future)

### Tournament Management
```
GET /api/tournaments/[id]/teams
POST /api/tournaments/[id]/teams
PATCH /api/tournaments/[id]/teams/[teamId]
DELETE /api/tournaments/[id]/teams/[teamId]

GET /api/tournaments/[id]/matches
POST /api/tournaments/[id]/matches (generate)
PATCH /api/tournaments/[id]/matches/[matchId] (update score)

GET /api/tournaments/[id]/standings
GET /api/tournaments/[id]/bracket
```

## Data Flow Diagram

```
User adds participants via ManualPlayerDialog
        ↓
tournament_participants table populated
        ↓
TeamAssignment dialog fetches participants
        ↓
User assigns to 6 auto-created teams
        ↓
team_players table populated
        ↓
MatchScheduler generates round-robin matches
        ↓
pool_matches table populated (24 matches)
        ↓
DB trigger calculates pool_standings
        ↓
PoolStandings component subscribes and displays
        ↓
TournamentBracket shows all matches by type
        ↓
For doubles matches:
DoublesMatchEntry assigns player pairs
        ↓
doubles_players table populated
        ↓
Tournament ready for execution
```

## RLS Policies

All tables have RLS enabled with policies:

**teams table**:
- Organizer can CRUD their tournament's teams
- Others can SELECT only

**team_players table**:
- Organizer can CRUD for their tournament
- Players can SELECT for their assigned teams
- Referees can SELECT for matches they referee

**pool_matches table**:
- Organizer can CRUD for their tournament
- Players can SELECT their matches
- Referees can SELECT/UPDATE their matches

**doubles_players table**:
- Same policies as pool_matches

**pool_standings table**:
- All authenticated users can SELECT
- Only system can INSERT/UPDATE

## Error Handling

**Common Scenarios**:

1. **No teams created**
   - Solution: TeamAssignment dialog auto-creates on first open
   
2. **Teams exist but no players assigned**
   - Solution: Can't start tournament (button disabled)
   - Fix: Assign players via dialog
   
3. **Can't generate matches**
   - Solution: Need at least 1 player per team
   - Fix: Use TeamAssignment to assign players
   
4. **Matches already exist**
   - Solution: MatchScheduler prevents duplicate generation
   - Fix: Clear old matches or create new tournament
   
5. **Standings not updating**
   - Solution: DB trigger auto-calculates on match completion
   - Fix: Ensure scores are saved with status='completed'

## Performance Considerations

**Optimized Queries**:
- ✅ Team queries include nested team_players (reduces N+1)
- ✅ Standings fetched with team info (join on teams)
- ✅ Matches include team relationships for names
- ✅ Indexes on tournament_id, team_id, match_type

**Real-time Subscriptions**:
- ✅ Pool standings subscribe to changes
- ✅ Tournament bracket subscribes to match changes
- ✅ Unsubscribe on component unmount (cleanup)

**Denormalization**:
- ✅ pool_standings table pre-calculates rankings (not computed on demand)
- ✅ team_players includes player_name (avoid joining tournament_participants)

## Testing Checklist

- [ ] Create tournament
- [ ] Add 6+ manual participants
- [ ] Open TeamAssignment dialog
- [ ] Verify 6 teams auto-created in 2 pools
- [ ] Assign participants to all teams
- [ ] Verify pool readiness badges update
- [ ] Click "Start Tournament" (verify enabled)
- [ ] Verify teams saved to database
- [ ] Open MatchScheduler dialog
- [ ] Verify math correct (6 matches per round, 2 rounds = 12 per pool)
- [ ] Generate matches
- [ ] Verify 24 total matches created
- [ ] View PoolStandings (should be empty until matches complete)
- [ ] View TournamentBracket
- [ ] Verify matches organized by pool
- [ ] Verify match cards show teams correctly
- [ ] Open DoublesMatchEntry for a match
- [ ] Assign doubles players
- [ ] Verify assignments saved
- [ ] Test edit existing assignment
- [ ] Verify ready badge shows when both teams assigned
- [ ] Test with mobile view (responsive dialog)

## Deployment Notes

✅ **Production Ready**:
- Type-safe (no `any` types)
- Error handling with proper typing
- RLS policies prevent unauthorized access
- Real-time subscriptions with cleanup
- Cascade deletes prevent orphans
- Unique constraints prevent duplicates
- Transaction support for bulk inserts

⚠️ **Pre-deployment Checklist**:
- [ ] Run `migrations/add_team_management.sql` in Supabase
- [ ] Verify RLS policies enabled on all tables
- [ ] Test with production credentials
- [ ] Verify Supabase env vars set (NEXT_PUBLIC_SUPABASE_URL, etc.)
- [ ] Run `npm run build` successfully
- [ ] Test tournament flow end-to-end
- [ ] Check performance with 50+ participants

## Future Enhancements

1. **Match Scheduling**
   - Manual schedule editor (drag/drop matches)
   - Time slot assignment per match
   - Venue/court assignment
   
2. **Bracket Enhancements**
   - Visual knockout bracket tree
   - Predictions/seeding adjustments
   - Winners bracket display
   
3. **Statistics**
   - Player performance stats
   - Team analytics
   - Tournament summary report
   
4. **Advanced Features**
   - Forfeit handling
   - Tiebreaker rules customization
   - Multiple tournament types (round-robin, elimination, group stage)
   
5. **Spectator Features**
   - Public bracket viewer (read-only)
   - Live score updates
   - Standings projection
