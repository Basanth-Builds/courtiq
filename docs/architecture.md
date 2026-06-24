# Court IQ — Architecture

## Overview

Court IQ is a monorepo built on **Turborepo + pnpm workspaces**, hosted on **Cloudflare** (Pages + Workers).

## Apps

### `apps/web`
- Next.js 15 (TypeScript, App Router)
- Deployed via OpenNext adapter to Cloudflare Pages
- Role-based routes: marketing, auth, dashboard, court-desk, referee, live

### `apps/worker`
- Cloudflare Worker for background jobs
- DUPR CSV generation, notifications, reconciliation

## Packages

| Package | Purpose |
|---|---|
| `@court-iq/ui` | shadcn/ui design system, brand tokens |
| `@court-iq/core` | Tournament engine — seeding, scoring, brackets, DUPR formatting |
| `@court-iq/db` | Prisma schema, migrations, repositories |
| `@court-iq/auth` | Phone OTP + RBAC helpers |
| `@court-iq/config` | Shared ESLint, TS, Tailwind |
| `@court-iq/types` | Shared TypeScript interfaces |

## Data Flow

```
Umpire (Court Desk)
  └─► POST /api/matches/:id/score  ──► DB (provisional)
                                    └─► WebSocket broadcast
                                    └─► Notify Referee

Referee (Console)
  └─► POST /api/matches/:id/confirm ──► DB (final)
                                     └─► Enqueue DUPR CSV job

Worker
  └─► Consume DUPR job queue
  └─► Generate CSV
  └─► Log submission
  └─► Notify admin
```

## Roles

| Role | Permissions |
|---|---|
| admin | All access, tournament creation, DUPR export |
| referee | Confirm scores, view all matches |
| umpire | Score entry for assigned courts |
| spectator | Read-only live view (no auth required) |

## Deployment

- `main` → production (courtiq.app)
- `staging` → staging (staging.courtiq.app)
- `dev` → preview (auto Cloudflare preview URL)
