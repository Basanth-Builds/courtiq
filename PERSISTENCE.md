# Data Persistence Strategy

## Current Implementation: In-Memory Store

The app currently uses an in-memory store (`apps/web/src/lib/store.ts`) initialized with demo data. This is:
- ✅ Simple and fast
- ✅ Perfect for dev and short-lived demos
- ❌ Loses data on server restart
- ❌ Not suitable for production with real tournaments

## Options for Production

### Option 1: Cloudflare KV (Simple, Recommended for MVP)
**Best for:** Small-scale production, single tournament at a time

The store already has optional KV methods (`loadFromKV`, `saveToKV`). To enable:

1. Create KV namespace in Cloudflare dashboard
2. Update `wrangler.toml` with your KV namespace ID
3. Call `saveToKV()` after each match update
4. Data persists across deployments

**Pros:**
- No additional services needed
- Already configured in wrangler.toml
- Integrated with Cloudflare Pages

**Cons:**
- Single global state (not great for concurrent updates)
- No query capabilities
- Limited to ~25MB per key

### Option 2: Cloudflare D1 (SQL Database)
**Best for:** Multiple tournaments, complex queries, better data integrity

Already configured in `wrangler.toml`. To enable:

1. Create D1 database in Cloudflare dashboard
2. Create tables for tournaments, categories, pools, matches
3. Replace store.ts with D1 queries
4. Run migrations

**Pros:**
- SQL queries and relationships
- Better for multiple concurrent users
- Proper data integrity

**Cons:**
- More setup required
- Need migration scripts
- More complex implementation

### Option 3: Supabase (Full Backend)
**Best for:** Complex requirements, real-time features, multiple apps

Would require:
1. Supabase project setup
2. Database tables and RLS policies
3. API client configuration
4. Environment variables for connection

**Pros:**
- Full PostgreSQL database
- Real-time subscriptions
- Built-in auth and storage
- Great developer experience

**Cons:**
- Another service to manage
- Additional costs
- Overkill for simple use case

### Option 4: Keep In-Memory (Current)
**Best for:** Static/semi-static tournaments where organizer controls deployments

Accept that data resets on deployment. Suitable if:
- Tournament data is mostly read-only after setup
- Organizer can trigger redeployment when needed
- Score updates happen in short bursts (during tournament)

## Recommendation

For **MVP/production with minimal complexity**:
1. Keep in-memory store for now
2. Document that organizer should update all scores in one session
3. Consider KV persistence if restarts become an issue
4. Move to D1 or Supabase if you add multiple tournaments or need persistence guarantees

For **serious production**:
- Use Cloudflare D1 (already in wrangler.toml)
- Implement proper database schema
- Add migration system
