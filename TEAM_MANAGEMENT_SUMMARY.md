# Team Management Features

## New Features Added

### 1. Edit Team Names
Admins can now edit team/player names directly from the admin dashboard:
- **Inline Editing**: Hover over any team name in a match to reveal the edit button
- **Real-time Updates**: Changes are immediately reflected on the spectator page
- **Per-Team Editing**: Edit team1 or team2 independently

**How to use:**
1. Go to `/admin`
2. Hover over any team name in the match table
3. Click the pencil icon that appears
4. Edit the name and click ✓ to save or ✕ to cancel

### 2. Add Teams to Pools
Admins can add new teams to existing pools:
- **Add Team Button**: Each pool has a "+ Add Team to Pool" button
- **Auto-Match Creation**: Adding a team automatically creates matches against all existing teams in that pool
- **Seamless Integration**: New matches appear immediately in the standings

**How to use:**
1. Go to `/admin`
2. Find the pool you want to add a team to
3. Click "+ Add Team to Pool" button
4. Enter the team name
5. Click "Add" - matches are created automatically

## Technical Implementation

### API Endpoints

#### POST `/api/scores/team`
Update a team name in a match.

**Request:**
```json
{
  "matchId": "match-id",
  "team": "team1" | "team2",
  "newName": "New Team Name"
}
```

**Response:**
```json
{ "success": true }
```

#### POST `/api/scores/add-team`
Add a new team to a pool.

**Request:**
```json
{
  "poolId": "pool-id",
  "teamName": "New Team Name"
}
```

**Response:**
```json
{ "success": true }
```

### Store Functions

#### `updateTeamName(matchId, team, newName)`
Updates the team name in a specific match across all categories and pools.

#### `addTeamToPool(poolId, teamName)`
Adds a new team to a pool by:
1. Finding all existing teams in the pool
2. Creating new matches between the new team and each existing team
3. Matches start with status: 'SCHEDULED'

### UI Components

**MatchRow Component Updates:**
- Added hover-reveal edit buttons for team names
- Inline editing mode with save/cancel buttons
- Edit button only visible on hover (UX pattern)

**Pool Section Updates:**
- "Add Team" button below pool header
- Collapsible add team form with input and action buttons
- Success/error messages for user feedback

## Auto-Refresh Behavior

Both the spectator page and admin page have auto-refresh:
- **Spectator (`/`)**: Polls every 2 seconds
- **Admin (`/admin`)**: Polls every 3 seconds

Any team name changes or new teams added will appear automatically on both pages without manual refresh.

## Security

- Both endpoints require admin authentication (HTTP-only cookie)
- Server-side validation of all inputs
- 401 response if not authenticated
- 400 response for invalid requests

## Database Persistence

Currently uses in-memory store (data persists during runtime but resets on server restart). For production persistence:
1. Enable Cloudflare KV in `store.ts`
2. Call `saveToKV()` after updates
3. Configure KV namespace in `wrangler.toml`

See `PERSISTENCE.md` for details.
