# Wrangler Commands for Monorepo

## ⚠️ Important: Always run Wrangler commands from `apps/web` directory!

This is a monorepo, so Wrangler needs to be run from the specific project directory where `wrangler.toml` is located.

---

## One-Time Setup Commands

### 1. Navigate to web app directory
```bash
cd apps/web
```

### 2. Create D1 Database
```bash
wrangler d1 create courtiq-db
```
**Copy the `database_id` from the output!**

### 3. Update wrangler.toml
Edit `apps/web/wrangler.toml` and replace `YOUR_D1_DATABASE_ID` with your actual database ID.

### 4. Create Database Schema
```bash
wrangler d1 execute courtiq-db --file=./db/schema.sql
```

### 5. Seed Initial Data
```bash
wrangler d1 execute courtiq-db --file=./db/seed.sql
```

### 6. Verify Database
```bash
wrangler d1 execute courtiq-db --command "SELECT * FROM tournaments;"
```

---

## Deployment Commands

### Option 1: Deploy via Cloudflare Pages Dashboard (Recommended)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Connect your GitHub repo
3. Cloudflare will handle builds and deployments automatically

### Option 2: Deploy Manually (If Needed)
```bash
cd apps/web
pnpm run deploy
```

This runs: `opennextjs-cloudflare build && wrangler deploy`

---

## Regular Maintenance Commands

### View Live Logs
```bash
cd apps/web
wrangler pages deployment tail
```

### Check Database Status
```bash
cd apps/web
wrangler d1 execute courtiq-db --command "SELECT COUNT(*) as total_matches FROM matches;"
```

### List All Matches
```bash
cd apps/web
wrangler d1 execute courtiq-db --command "SELECT * FROM matches LIMIT 10;"
```

### Clear All Data (Careful!)
```bash
cd apps/web
wrangler d1 execute courtiq-db --command "DELETE FROM matches; DELETE FROM pools; DELETE FROM categories; DELETE FROM tournaments;"
```

### Re-seed After Clearing
```bash
cd apps/web
wrangler d1 execute courtiq-db --file=./db/seed.sql
```

---

## Quick Troubleshooting

### Error: "wrangler.toml not found"
**Solution**: You're in the wrong directory. Run `cd apps/web` first.

### Error: "Database binding not found"
**Solution**: 
1. Check D1 binding in Cloudflare Pages dashboard
2. Settings → Functions → D1 database bindings
3. Variable name: `DB`, Database: `courtiq-db`

### Error: "Database not found"
**Solution**: Make sure you created the database with `wrangler d1 create courtiq-db`

---

## Recommended Workflow

### For Local Development
```bash
# From project root
cd apps/web
pnpm dev
```
Uses in-memory store - no database needed.

### For Production Database Management
```bash
# Always start from project root, then:
cd apps/web

# Then run any wrangler command:
wrangler d1 execute courtiq-db --command "YOUR SQL HERE"
```

### For Deployment
**Let Cloudflare Pages handle it automatically!**
- Push to `dev` branch → Auto-deploys to preview
- Merge to `main` → Auto-deploys to production

---

## Summary

✅ **ALWAYS** run Wrangler commands from `apps/web` directory  
✅ Use `pnpm run deploy` for manual deployments  
✅ Let Cloudflare Pages auto-deploy from GitHub (recommended)  
✅ Database commands need `cd apps/web` first  

**Never run Wrangler from the monorepo root!**
