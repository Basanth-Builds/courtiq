# Court IQ 🏓

> **Score it live. Run it smart.**

Court IQ is a production-grade tournament management platform built for pickleball — automating score entry, pool seeding, playoff draws, and DUPR submission from a single smart interface.

## ⚡ Quick Start: Production-Ready Spectator + Admin Portal

The app is **production-ready** with two main portals:
- **Public Spectator View** (`/`) - Read-only live scores for all matches
- **Protected Admin Portal** (`/admin`) - Secure dashboard for organizers to update scores

### Features

✅ Public spectator page showing all categories, pools, matches, and final scores  
✅ Protected admin dashboard with server-side authentication  
✅ Secure login flow with HTTP-only cookies  
✅ Real-time updates with auto-refresh  
✅ Cloudflare Pages ready with OpenNext adapter  

### Environment Setup

**Required:**
```bash
ADMIN_PASSWORD=your_strong_password_here  # Generate: openssl rand -base64 32
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloudflare Pages setup instructions.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Hosting | Cloudflare Pages + Workers |
| Auth | Phone OTP via Twilio Verify + Admin password auth |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database | PostgreSQL + Prisma (optional, in-memory store for MVP) |
| Monorepo | Turborepo + pnpm |
| Jobs | Cloudflare Workers |

## Apps & Packages

| Package | Description |
|---------|-------------|
| `apps/web` | Main Next.js web application |
| `apps/worker` | Cloudflare Worker for background jobs |
| `packages/ui` | Shared shadcn/ui component system |
| `packages/core` | Tournament engine, seeding, bracket logic |
| `packages/db` | Prisma schema + data access layer |
| `packages/auth` | Phone OTP + RBAC |
| `packages/types` | Shared TypeScript types |
| `packages/config` | Shared ESLint, TS, Tailwind configs |

## Getting Started

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp apps/web/.env.local.example apps/web/.env.local
# Edit .env.local and set ADMIN_PASSWORD

# Run dev server
pnpm dev
```

**Access:**
- Spectator view: http://localhost:3000
- Admin panel: http://localhost:3000/admin

### With Database (Optional)

```bash
# Copy env file
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed sample data
pnpm db:seed
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Spectator view with live scores |
| `/admin` | Protected | Admin dashboard for score updates |
| `/admin/login` | Public | Admin login page |

## Deployment

### Cloudflare Pages

```
Build command: pnpm build
Build output directory: .open-next
Root directory: apps/web
```

**Environment Variables:**
- `ADMIN_PASSWORD` (required) - Strong password for admin access

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup.

### Data Persistence

Current: In-memory store (suitable for single-tournament sessions)  
Upgrades: Cloudflare KV, D1, or Supabase

See [PERSISTENCE.md](./PERSISTENCE.md) for options.

## Branches

| Branch | Purpose |
|--------|----------|
| `main` | Production |
| `staging` | Demo & testing |
| `dev` | Active development |

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Cloudflare Pages deployment guide
- [PERSISTENCE.md](./PERSISTENCE.md) - Data storage options

## License

Private — Court IQ © 2026
