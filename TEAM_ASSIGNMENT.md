# Team Assignment & Tournament Bracket System

## Overview

The team assignment system enables tournament organizers to:
1. Assign manually added participants to 6 teams (Team 1-6)
2. Organize teams into 2 pools of 3 teams each
3. Generate round-robin pool matches automatically
4. Calculate pool standings and rankings
5. Create semifinal and final matches based on pool rankings
6. Manage doubles match player assignments

## Database Schema

### Teams Table
```sql
teams (
  id UUID PRIMARY KEY
  tournament_id UUID -- FK to tournaments
  name VARCHAR (e.g., "Team 1")
  team_number INT (1-6)
  pool INT (1 or 2)
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

### Team Players Table
```sql
team_players (
  id UUID PRIMARY KEY
  team_id UUID -- FK to teams
  participant_id UUID -- FK to tournament_participants
  player_name VARCHAR -- Denormalized for convenience
  created_at TIMESTAMP
)
```

### Pool Matches Table
```sql
pool_matches (
  id UUID PRIMARY KEY
  tournament_id UUID
  team1_id UUID -- FK to teams
  team2_id UUID -- FK to teams
  pool INT (1 or 2) -- Which pool this match is in
  match_type VARCHAR ('pool' | 'semifinal' | 'final')
  match_round INT -- Round number for pool play
  scheduled_at TIMESTAMP
  status VARCHAR ('pending' | 'live' | 'completed')
  scores JSONB -- { team1_score, team2_score }
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

### Doubles Players Table
```sql
doubles_players (
  id UUID PRIMARY KEY
  pool_match_id UUID -- FK to pool_matches
  team_id UUID -- FK to teams
  player1_id UUID -- FK to tournament_participants
  player2_id UUID -- FK to tournament_participants
  player1_name VARCHAR -- Manual entry support
  player2_name VARCHAR -- Manual entry support
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

### Pool Standings Table
```sql
pool_standings (
  id UUID PRIMARY KEY
  team_id UUID -- FK to teams
  pool INT
  matches_played INT
  wins INT
  losses INT
  total_points_for INT
  total_points_against INT
  rank INT
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

## Features

### 1. Team Assignment Dialog (`components/team-assignment.tsx`)

**Purpose**: Modal interface for assigning participants to teams

**Features**:
- Displays all manual participants in left panel
- Shows all 6 teams organized by pool in right panel
- Multi-select players before assigning to a team
- Auto-creates teams on first open (Team 1-6, pools 1-2)
- Remove players from teams with delete button
- Pool readiness indicator (✓ Ready badge when all teams have players)
- "Start Tournament" button enabled only when both pools fully configured

**Usage**:
```tsx
<TeamAssignment tournamentId={id} onTeamsConfigured={() => {
  // Called when user clicks "Start Tournament"
}} />
```

**Props**:
- `tournamentId` (string, required): Tournament ID
- `onTeamsConfigured` (function, optional): Callback when tournament start is confirmed

**State Management**:
- `participants`: Fetched from `tournament_participants` table
- `teams`: Fetched/created in `teams` table with nested `team_players`
- `selectedPlayers`: Array of participant IDs to assign
- `selectedTeamId`: Currently selected team for assignment

**API Operations**:
- GET tournament_participants (all for tournament)
- GET/POST teams (creates if none exist)
- POST team_players (insert selected participants)
- DELETE team_players (remove player from team)

### 2. Pool Configuration

Automatically done on first team assignment dialog open:
- **Pool 1**: Teams 1, 2, 3
- **Pool 2**: Teams 4, 5, 6

Each pool automatically gets 3 teams. No manual configuration needed.

### 3. Match Scheduler

**Algorithm**: Round-robin pool play
- Each team plays every other team in their pool
- 2 matches per opponent = 12 matches per pool
- Total: 24 pool play matches

**Pool 1 Matches** (Teams 1, 2, 3):
```
Round 1:
  Team 1 vs Team 2
  Team 3 vs Team 1
  Team 2 vs Team 3

Round 2:
  Team 2 vs Team 1
  Team 1 vs Team 3
  Team 3 vs Team 2
```

**Pool 2 Matches** (Teams 4, 5, 6): Same pattern with teams 4-6

**Match Status Flow**:
- pending → live → completed

**Scoring**:
- Win: 3 points (or 1 win record)
- Loss: 0 points (or 1 loss record)
- Stored in `scores` JSONB field: `{ team1_score, team2_score }`

### 4. Pool Standings Calculation

Rankings determined by:
1. **Wins** (primary sort)
2. **Points For vs Against** (tiebreaker 1)
3. **Head-to-Head** (if still tied, could be added)

**Trigger**: Auto-calculated when matches are completed via database trigger

```sql
-- Trigger on pool_matches INSERT/UPDATE
-- Recalculates pool_standings for affected teams
```

### 5. Knockout Bracket

**Semifinals**:
- Pool 1 1st vs Pool 2 2nd
- Pool 2 1st vs Pool 1 2nd

**Finals**:
- Winner of Semifinal 1 vs Winner of Semifinal 2

**Automatic Generation**:
- Once all pool matches complete and standings calculated
- Create 2 semifinal matches
- Create 1 final match

### 6. Doubles Match Entry

**Per-Match Player Assignment**:
- Each pool match can have doubles variant with 2 players per team
- `doubles_players` table tracks player pairs

**Flexibility**:
- Support for manual player name entry (in addition to selecting from roster)
- Allow same player in multiple matches
- Track doubles player pairs per match

## Integration Points

### 1. Tournament Detail Page
```tsx
// app/organizer/tournaments/[id]/page.tsx
<TeamAssignment 
  tournamentId={id}
  onTeamsConfigured={() => {
    // Navigate to match scheduler
    // Or show bracket view
  }}
/>
```

### 2. Match Scheduling Interface (To be built)
```tsx
// components/match-scheduler.tsx
// Auto-generates round-robin matches
// Can manually adjust schedule if needed
```

### 3. Pool Standings Display (To be built)
```tsx
// components/pool-standings.tsx
// Shows current rankings by pool
// Updates in real-time as matches complete
```

### 4. Bracket Display (To be built)
```tsx
// components/tournament-bracket.tsx
// Visual bracket showing:
// - Pool play matches
// - Semifinals based on rankings
// - Finals
```

## Data Flow

```
Manual Participants (manual-player-dialog)
          ↓
Tournament Participants (tournament_participants table)
          ↓
Team Assignment Dialog
          ↓
Teams + Team Players tables
          ↓
Match Scheduler (generates pool_matches)
          ↓
Pool Matches table (12 per pool)
          ↓
Standings Calculator (recalculates pool_standings)
          ↓
Bracket Generator (creates semifinals/finals)
          ↓
Final Bracket Display
```

## RLS Policies

All tables have RLS policies ensuring:
- Organizer can only see their own tournaments' data
- Players can only see matches they're assigned to
- Referees can only see and update matches assigned to them

## Next Steps

1. ✅ Database schema created (migrations/add_team_management.sql)
2. ✅ Team assignment dialog implemented
3. ⏳ Match scheduler component (generates round-robin)
4. ⏳ Pool standings display
5. ⏳ Knockout bracket generator
6. ⏳ Tournament bracket viewer
7. ⏳ Doubles match entry interface
8. ⏳ End-to-end testing

## API Endpoints

### Create Teams (Auto in dialog)
POST /api/tournaments/[id]/teams
```json
{
  "teams": [
    { "team_number": 1, "pool": 1, "name": "Team 1" },
    ...
  ]
}
```

### Assign Players to Team
POST /api/tournaments/[id]/teams/[teamId]/players
```json
{
  "players": [
    { "participant_id": "uuid", "player_name": "John Doe" }
  ]
}
```

### Generate Matches
POST /api/tournaments/[id]/matches/generate
```json
{
  "match_type": "pool" | "semifinal" | "final"
}
```

### Update Match Score
PATCH /api/tournaments/[id]/matches/[matchId]
```json
{
  "status": "completed",
  "scores": { "team1_score": 3, "team2_score": 1 }
}
```

## Error Handling

**Common Issues**:
- **Teams not created**: Dialog auto-creates on first open
- **Participants not visible**: Must add via Manual Player Dialog first
- **Can't start tournament**: Both pools must have all 3 teams assigned players
- **Matches not generating**: All participants must be assigned to teams

## Testing Checklist

- [ ] Create tournament
- [ ] Add manual participants (3+ to test)
- [ ] Open Team Assignment dialog
- [ ] Verify 6 teams auto-created
- [ ] Select players and assign to teams
- [ ] Remove a player and reassign
- [ ] Verify pool readiness badges update
- [ ] Click "Start Tournament" (only enabled when ready)
- [ ] Verify teams in database
- [ ] Verify team_players in database
- [ ] Test with mobile view (dialog responsive)

## Production Considerations

✅ RLS policies prevent unauthorized access
✅ Cascade deletes prevent orphaned records
✅ Unique constraints prevent duplicate assignments
✅ Error handling with proper error messages
✅ Type-safe with TypeScript
✅ No `any` types used
✅ Proper error typing with `unknown`
✅ Real-time updates via Supabase subscriptions ready

## Future Enhancements

1. Team captain assignment
2. Team roster limits (min/max players)
3. Manual match scheduling override
4. Bracket predictions/seeding adjustments
5. Live score entry interface
6. Tournament statistics/analytics
7. Export bracket/standings as PDF
8. Spectator bracket view (read-only)
