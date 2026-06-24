# Court IQ — Product Specification

## Core Workflow

1. **Tournament Creation** — Admin creates tournament, imports participants (CSV), system assigns DUPR IDs
2. **Pool Seeding** — System seeds pools using DUPR ratings (configurable pool sizes)
3. **Match Scheduling** — Matches assigned to courts, umpires notified
4. **Live Scoring** — Umpire enters point-by-point or final scores on Court Desk (mobile)
5. **Referee Confirmation** — Referee reviews DUPR validation checklist and confirms result
6. **Auto Advancement** — Top 2 per pool advance to playoffs; bracket drawn automatically
7. **Playoff Rounds** — Quarterfinals → Semis → Finals + 3rd Place
8. **DUPR Export** — All confirmed matches exported to DUPR-compatible CSV

## Scoring Rules

- Minimum 6 points required for DUPR eligibility
- Each result requires: umpire submission + referee confirmation
- Disputes flagged for admin override with reason field
- All changes logged in immutable audit trail

## Pages

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Phone OTP login |
| `/verify` | Public | OTP verification |
| `/dashboard` | All roles | Tournament list + stats |
| `/tournaments/:id` | All roles | Tournament detail, pools, bracket |
| `/court-desk/:matchId` | Umpire | Score entry |
| `/referee/:matchId` | Referee | Confirmation console |
| `/live/:tournamentId` | Public | Live scoreboard |
| `/exports` | Admin | DUPR CSV download |
