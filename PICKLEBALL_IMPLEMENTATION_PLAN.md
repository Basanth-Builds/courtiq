# Complete Pickleball Tournament System - Implementation Plan

## 🎯 Goal
Build a complete, production-ready pickleball tournament system for organizers and spectators.

## 📋 Core Features (Priority Order)

### ✅ Phase 1: Multi-Game Scoring System (CRITICAL)
**What**: Matches with best-of-3 games, each to 11 points (win by 2)
**Why**: Core pickleball scoring - different from simple win/loss
**Tasks**:
- [x] Enhanced DB schema with `games` table
- [ ] Update D1 store to fetch/update games
- [ ] API endpoints for game scoring
- [ ] Admin UI: Game-by-game scoring interface
- [ ] Spectator UI: Display games within matches

### ✅ Phase 2: Court Management (HIGH)
**What**: 4 courts, assign matches to courts, show current matches per court
**Why**: Organizers need to know which matches are on which courts
**Tasks**:
- [x] Enhanced DB schema with `courts` table
- [ ] Update D1 store for court operations
- [ ] API endpoints for court assignments
- [ ] Admin UI: Assign match to court, mark court status
- [ ] Spectator UI: "Court Board" showing all 4 courts + current matches

### ✅ Phase 3: Live Matches Widget (HIGH)
**What**: Show currently in-progress matches prominently
**Why**: Spectators want to see what's happening NOW
**Tasks**:
- [ ] API endpoint to fetch live matches
- [ ] Spectator UI: Live matches carousel/grid at top of page
- [ ] Real-time updates every 5 seconds

### Phase 4: Schedule System (MEDIUM)
**What**: Time slots for matches (e.g., 9:00 AM, 9:30 AM, etc.)
**Why**: Organizers and spectators need to know when matches happen
**Tasks**:
- [x] Enhanced DB schema with `schedule_slots` table
- [ ] Update D1 store for schedule operations
- [ ] API endpoints for schedule
- [ ] Admin UI: Schedule editor (assign time slots)
- [ ] Spectator UI: Schedule view (chronological list)

### Phase 5: Bracket/Playoff System (MEDIUM)
**What**: Generate single-elimination brackets from pool results
**Why**: Tournaments typically have playoffs after pools
**Tasks**:
- [x] Enhanced DB schema with `brackets` table
- [ ] Bracket generation algorithm (seed teams from pool standings)
- [ ] API endpoints for brackets
- [ ] Admin UI: Generate bracket button, edit bracket
- [ ] Spectator UI: Bracket visualization (tree view)

### Phase 6: Player Stats (LOW)
**What**: Track individual player/team performance across tournament
**Why**: Nice-to-have for spectators and players
**Tasks**:
- [x] Enhanced DB schema with `players` and `player_stats` tables
- [ ] Stats calculation after each game
- [ ] API endpoints for stats
- [ ] Spectator UI: Leaderboard, player profiles

## 🚀 Implementation Strategy

1. **Build incrementally**: Each phase should be deployable
2. **Test in dev**: Use in-memory store for quick iteration
3. **Deploy to production**: Push to D1 when phase is complete
4. **Get feedback**: User testing at each phase

## 📦 Deliverables

- **For Organizers**:
  - ✅ Pool management (done)
  - ✅ Match scoring with multi-game support
  - ✅ Court assignments
  - ✅ Quick match entry interface
  - ✅ Schedule editor
  - ✅ Generate brackets from pools

- **For Spectators**:
  - ✅ Live scores with game details
  - ✅ Pool standings (done)
  - ✅ Court board (see what's on each court)
  - ✅ Live matches highlight
  - ✅ Schedule view
  - ✅ Bracket visualization
  - ✅ Mobile-optimized UI

## ⏱️ Time Estimate
- Phase 1: 1-2 hours (multi-game scoring)
- Phase 2: 1 hour (court management)
- Phase 3: 30 minutes (live matches widget)
- Phase 4: 1 hour (schedule system)
- Phase 5: 2 hours (brackets)
- Phase 6: 1 hour (player stats)

**Total: 6-7 hours for complete system**

## 🎯 Next Steps
Start with Phase 1: Multi-game scoring (most critical feature)
