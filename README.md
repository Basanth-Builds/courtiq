# CourtIQ - Simple Pickleball Tournament System 🏐

A production-ready pickleball tournament management system built with Next.js and Cloudflare D1.

## 🎯 Features

- **Public Spectator View** - Real-time tournament scores and standings
- **Admin Dashboard** - Update pools, matches, teams, and scores
- **Multi-Game Scoring** - Best-of-3 games (11 points, win by 2)
- **Court Management** - Track 4 courts with real-time status
- **Pool Management** - Organizers can add/edit pools and teams
- **Secure Admin Access** - Password-protected organizer portal

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Type check
pnpm run typecheck

# Build
pnpm run build

# Deploy to Cloudflare
pnpm run deploy
```

## 📁 Project Structure

```
courtiq/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Public spectator view
│   │   ├── admin/        # Admin dashboard
│   │   └── api/          # API routes
│   ├── components/       # React components
│   └── lib/              # Utilities, auth, database
├── db/
│   ├── schema.sql        # D1 database schema
│   └── seed.sql          # Initial tournament data
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
└── next.config.ts        # Next.js configuration
```

## 🗄️ Database Setup (Cloudflare D1)

```bash
# 1. Create D1 database
wrangler d1 create courtiq-db

# 2. Update wrangler.toml with database ID

# 3. Initialize schema
wrangler d1 execute courtiq-db --remote --file=./db/schema.sql

# 4. Seed data
wrangler d1 execute courtiq-db --remote --file=./db/seed.sql

# 5. Verify
wrangler d1 execute courtiq-db --remote --command "SELECT * FROM tournaments;"
```

## ☁️ Cloudflare Pages Deployment

### Auto-Deploy (Recommended)

1. Go to Cloudflare Dashboard → Workers & Pages
2. Create application → Pages → Connect to Git
3. Select repository: `Basanth-Builds/courtiq`
4. Branch: `simplified`
5. Build settings:
   - Framework: Next.js
   - Build command: `pnpm run build`
   - Build output: `.next`
6. Deploy → Auto-deploys on every push!

### Manual Deploy

```bash
pnpm run deploy
```

## 🔑 Admin Access

- **URL**: `/admin/login`
- **Password**: `D!nk$`

## 🎪 Tournament Configuration

Edit in `src/lib/tournament-data.ts`:

- Tournament name: Dink Syndicate Tournament
- Date: July 5, 2026
- Venue: Picklers' Hub - Visakhpatnam
- Categories: Open Singles, Open Doubles, Openb Doubles 3.8

## 📊 Tech Stack

- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS 4
- **Database**: Cloudflare D1 (SQLite)
- **Runtime**: Cloudflare Workers
- **Deployment**: Cloudflare Pages

## 📖 Documentation

- [Simple Deployment Guide](./SIMPLE_DEPLOYMENT.md)
- [Production Ready Checklist](./PRODUCTION_READY.md)

## 🎉 Why Simplified?

**Before**: Complex Turborepo monorepo with multiple packages  
**After**: Simple standalone Next.js app

- ✅ Single `package.json`
- ✅ Simple commands: `pnpm build`, `pnpm deploy`
- ✅ Direct Cloudflare deployment
- ✅ No monorepo complexity
- ✅ Easy to understand and maintain

## 📝 License

Private project for Dink Syndicate Tournament

---

**Ready for tournament day: July 5, 2026! 🎉**
