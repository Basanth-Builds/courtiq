# Manual Player Entry Feature

Tournament organizers can now manually add player names directly without requiring those players to create accounts first. This feature is production-ready with validation, error handling, and real-time updates.

## Overview

### Key Features

- **No Account Required**: Players don't need to sign up or authenticate
- **Bulk Entry**: Add multiple players at once with edit/delete capabilities
- **Optional Contact Info**: Email, phone, and notes fields for additional context
- **Real-Time Updates**: Participants list updates in real-time using Supabase subscriptions
- **Duplicate Prevention**: Prevents adding the same player twice to the same tournament
- **Full CRUD Operations**: Create, read, update, and delete participant entries
- **Production-Ready**: Includes validation, error handling, and accessibility

## Database Schema

A new `tournament_participants` table stores manually added players:

```sql
CREATE TABLE tournament_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Constraints

- **Unique Constraint**: Combination of `(tournament_id, name, email)` is unique
- **Auto-Updated**: `updated_at` timestamp updates automatically on changes
- **Cascade Delete**: When a tournament is deleted, all participants are deleted

### Security (Row Level Security)

- Organizers can manage participants for their tournaments only
- Anyone can view tournament participants
- Unauthenticated users cannot modify data

## Components

### 1. ManualPlayerDialog (`components/manual-player-dialog.tsx`)

Client component for adding manual players to a tournament.

**Features:**
- Form to enter player details (name, email, phone, notes)
- Real-time validation:
  - Name is required
  - Email format validation
  - Phone number validation (10+ digits)
  - Duplicate name prevention
- Add to list before bulk save
- Edit existing entries
- Remove entries before saving
- Batch insert all players at once

**Usage:**
```tsx
<ManualPlayerDialog tournamentId={tournamentId} onPlayersAdded={() => console.log('Saved')} />
```

**Props:**
- `tournamentId` (string, required): The tournament ID
- `onPlayersAdded` (function, optional): Callback after players are successfully added

### 2. TournamentParticipants (`components/tournament-participants.tsx`)

Client component displaying all manually added participants for a tournament.

**Features:**
- Real-time subscription to participant changes
- Display participant details (name, email, phone, notes)
- Delete functionality with confirmation
- Loading and empty states
- Auto-refresh on data changes

**Usage:**
```tsx
<TournamentParticipants tournamentId={tournamentId} onRefresh={() => console.log('Refreshed')} />
```

**Props:**
- `tournamentId` (string, required): The tournament ID
- `onRefresh` (function, optional): Callback to refresh parent data

### 3. API Route (`app/api/tournaments/[id]/participants/route.ts`)

Server endpoint for managing tournament participants.

**Endpoints:**

#### GET `/api/tournaments/[id]/participants`
Fetch all participants for a tournament.

**Response:**
```json
{
  "participants": [
    {
      "id": "uuid",
      "tournament_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "notes": "Jersey #5",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### DELETE `/api/tournaments/[id]/participants?participantId=<id>`
Delete a specific participant.

**Response:**
```json
{ "success": true }
```

**Error Handling:**
- 401 Unauthorized: User not authenticated
- 403 Forbidden: User is not the tournament organizer
- 400 Bad Request: Missing required parameters
- 500 Internal Server Error: Database or server error

## Setup Instructions

### 1. Database Migration

Run the migration SQL to create the `tournament_participants` table:

```bash
# Option 1: Using Supabase SQL Editor
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy content from migrations/add_tournament_participants.sql
4. Click Run

# Option 2: Using psql/CLI
psql -h your-db-host -U postgres -d postgres -f migrations/add_tournament_participants.sql
```

### 2. Integration

The feature is already integrated into the tournament detail page (`app/organizer/tournaments/[id]/page.tsx`):

- **"Add Players Manually" button** in the header next to "Add Players"
- **Tournament Participants card** showing all manually added players below registered players

## Usage Guide for Organizers

### Adding Manual Players

1. Navigate to a tournament you organize
2. Click **"Add Players Manually"** button
3. Fill in player details:
   - **Name** (required): Player's full name
   - **Email** (optional): Player's email address
   - **Phone** (optional): Player's phone number (10+ digits)
   - **Notes** (optional): Additional info (jersey number, skill level, etc.)
4. Click **"Add to List"** to add to the form
5. Repeat for more players or edit/delete from the list
6. Click **"Save N Players"** to save all at once
7. Participants appear in the "Manual Participants" section below

### Editing Players

1. In the "Players to Add" list, click the **Edit** icon
2. Modify the fields
3. Click **"Update Player"**
4. Continue adding or make changes to others

### Removing Players

1. Before saving: Click the **Delete** icon on the player in the "Players to Add" list
2. After saving: Click the **Delete** icon in the "Manual Participants" section

## Production Considerations

### Validation

✅ **Name**: Required, trimmed whitespace  
✅ **Email**: Optional, format validation  
✅ **Phone**: Optional, 10+ digits validation  
✅ **Duplicate Prevention**: Same name per tournament not allowed  

### Error Handling

- Duplicate unique constraint violations are caught and reported
- User-friendly error messages via toast notifications
- Server-side authorization checks prevent unauthorized access
- Optimistic UI updates rollback on error

### Performance

- Real-time subscriptions use Supabase channels for efficient updates
- Indexes on `tournament_id` and `created_at` for fast queries
- Batch insert for multiple participants in single operation
- Lazy loading of participants list

### Security

- Row-level security (RLS) policies restrict access
- Only organizers can manage their tournament participants
- Database constraints prevent invalid data
- API endpoints verify user authorization

### Testing Checklist

- [x] Add single player with all fields
- [x] Add multiple players in one go
- [x] Edit player details before saving
- [x] Delete player before saving
- [x] Delete player after saving (in participants section)
- [x] Prevent duplicate player names
- [x] Validate email format
- [x] Validate phone number format
- [x] Real-time updates on add/delete
- [x] Error handling for network failures
- [x] Verify RLS prevents unauthorized access
- [x] Test with large number of participants (100+)

## Future Enhancements

Potential improvements for future versions:

1. **Bulk Import**: CSV/Excel import for multiple players
2. **QR Code Check-in**: Generate QR codes for participant check-in
3. **Email Invitations**: Send participation details via email
4. **Team Assignment**: Pre-assign players to teams
5. **Custom Fields**: Add tournament-specific participant fields
6. **Export**: Export participant list as CSV/PDF
7. **Player Profile Photos**: Upload participant images
8. **Duplicate Prevention Alerts**: Warn if similar names already exist

## Troubleshooting

### Players not appearing after adding

1. Check browser console for errors
2. Verify tournament ID is correct
3. Ensure you have organizer role for this tournament
4. Check that Supabase environment variables are set

### Validation errors

- **"Player name is required"**: Name field cannot be empty
- **"Please enter a valid email address"**: Email must be in format user@domain.com
- **"Please enter a valid phone number"**: Phone must be 10+ digits
- **"A player with this name already exists"**: Another player in this tournament has the same name

### Database errors

- **"One or more players already exist in this tournament"**: Unique constraint violation
- Check the Supabase dashboard for detailed error logs

## Code Examples

### Adding players programmatically

```typescript
const supabase = createClientComponentClient()

const participants = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', phone: '+14155552671' },
]

const { error } = await supabase
  .from('tournament_participants')
  .insert(participants.map(p => ({
    tournament_id: tournamentId,
    ...p
  })))
```

### Fetching participants

```typescript
const { data: participants, error } = await supabase
  .from('tournament_participants')
  .select('*')
  .eq('tournament_id', tournamentId)
  .order('created_at', { ascending: false })
```

### Real-time subscription

```typescript
const subscription = supabase
  .channel(`participants:${tournamentId}`)
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tournament_participants',
      filter: `tournament_id=eq.${tournamentId}`
    },
    () => {
      // Refresh participants
      fetchParticipants()
    }
  )
  .subscribe()
```

## Files Changed

- `migrations/add_tournament_participants.sql` - Database schema
- `components/manual-player-dialog.tsx` - Player entry form
- `components/tournament-participants.tsx` - Participants display
- `app/api/tournaments/[id]/participants/route.ts` - API endpoint
- `app/organizer/tournaments/[id]/page.tsx` - Integration
