# Quick Start - Real-Time Updates & Match Creation

## ✨ What's New

### For Spectators (/)
- **Auto-refresh every 2 seconds** - No manual refresh needed
- **Focus refetch** - Fresh data when you return to the tab
- See score updates, team changes, and new matches instantly

### For Admins (/admin)
- **Auto-refresh every 3 seconds** - All changes sync automatically
- **Immediate feedback** - Changes appear instantly after saving
- **Create matches** - New "+ Create Match" button in each pool

## 🎯 How to Use Match Creation

### Step 1: Login to Admin
```
/admin/login
Password: D!nk$
```

### Step 2: Open a Pool
- Click any category (Open Singles, Open Doubles, etc.)
- Pools expand to show matches and standings

### Step 3: Create a Match
1. Click purple **"+ Create Match"** button (next to "Add Team")
2. Fill in the form:
   - **Team 1**: Enter first team/player name
   - **Team 2**: Enter second team/player name
   - **Court #**: Optional court number
3. Click **"Create"**
4. Match appears immediately in the pool

### Step 4: Update Match Score
- Click "Edit" on any match row
- Update scores for team 1 and team 2
- Change status (SCHEDULED, IN_PROGRESS, COMPLETED)
- Click "Save"
- All spectators see update within 2 seconds

## 🧪 Testing Real-Time Updates

### Test 1: Cross-Browser Score Update
1. Open `/admin` in Browser 1
2. Open `/` (spectator) in Browser 2 or phone
3. Update a match score in Browser 1
4. Watch Browser 2 update within 2-3 seconds ✨

### Test 2: Match Creation Sync
1. Open `/admin` in Browser 1
2. Open `/` (spectator) in Browser 2
3. Create a new match in Browser 1
4. Watch new match appear in Browser 2 within 2-3 seconds ✨

### Test 3: Window Focus Refresh
1. Open spectator page
2. Switch to another tab/app
3. Update scores in admin
4. Switch back to spectator tab
5. Data refreshes automatically ✨

## 📱 Mobile Testing

Open spectator page on phone:
```
https://your-site.pages.dev/
```

- Scores update automatically every 2 seconds
- No pull-to-refresh needed
- Works on iOS Safari, Android Chrome, all browsers

## 🔧 Development Testing

### Local Dev Server:
```bash
npm run dev
```

Then open:
- Spectator: http://localhost:3000/
- Admin: http://localhost:3000/admin/login

### Check Real-Time Updates Work:
1. Open multiple browser windows
2. Login to admin in one
3. Update score or create match
4. Watch other windows sync automatically

## 🚀 Production Deployment

When deployed to Cloudflare Pages, the app will:
- Use D1 database for persistence
- Maintain all real-time polling features
- Support unlimited concurrent spectators
- All updates sync via the shared `/api/scores` endpoint

## 📊 API Endpoints Used

### GET /api/scores
- Returns all tournament data
- Called every 2-3 seconds by clients
- No authentication needed (public data)

### POST /api/scores/match/create
- Creates new match in a pool
- Requires admin authentication
- Body: `{ poolId, team1, team2, courtNumber, status }`

### Other Admin Endpoints:
- `POST /api/scores/match` - Update match score
- `POST /api/scores/pool` - Update pool name
- `POST /api/scores/team` - Update team name
- `POST /api/scores/add-team` - Add team to pool
- `POST /api/pools` - Create new pool

## 🎨 UI Changes

### Admin Page - Pool Section:
```
┌─────────────────────────────────────┐
│  Pool A                             │
│  ┌─────────────────────────────┐   │
│  │ + Add Team to Pool          │   │
│  │ + Create Match              │◄── NEW!
│  └─────────────────────────────┘   │
│                                     │
│  ┌── Create New Match ──────────┐  │◄── NEW!
│  │ Team 1: [____________]       │  │
│  │ Team 2: [____________]       │  │
│  │ Court #: [_____]             │  │
│  │ [Create] [Cancel]            │  │
│  └──────────────────────────────┘  │
│                                     │
│  Match 1: Team A vs Team B          │
│  Match 2: Team C vs Team D          │
└─────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Updates not syncing?
- Check browser console for errors
- Verify you're connected to internet
- Check polling is working (Network tab in DevTools)

### Match creation not working?
- Ensure you're logged in as admin
- Check both team names are filled in
- Look for error message below form

### Build errors?
```bash
npm run build
```
Should complete with no TypeScript errors.

## ✅ What's Working

- ✅ Real-time score updates across all devices
- ✅ Match creation from admin UI
- ✅ Automatic polling every 2-3 seconds
- ✅ Window focus refresh
- ✅ Immediate feedback after mutations
- ✅ TypeScript compilation
- ✅ Production build
- ✅ Cloudflare Pages compatible

## 📝 Next Steps

For production deployment:
1. Push to `dev` branch (done ✓)
2. Cloudflare Pages auto-deploys from GitHub
3. Verify D1 database has `matches` table
4. Test real-time updates across devices
5. Monitor for any errors in Cloudflare dashboard
