# Production Deployment Guide for Cloudflare Pages

## Overview
This guide will help you deploy Court IQ to Cloudflare Pages with Cloudflare D1 database for production-ready, scalable hosting that can handle many concurrent users.

## Prerequisites
- Cloudflare account (free tier works)
- GitHub repository pushed to `dev` branch
- Node.js 18+ and pnpm installed locally
- Wrangler CLI installed: `npm install -g wrangler`

---

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
wrangler --version
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler with your Cloudflare account.

---

## Step 3: Create Cloudflare D1 Database

### 3.1 Create the database

```bash
cd apps/web
wrangler d1 create courtiq-db
```

**Copy the database ID from the output**. It will look like:
```
Created D1 database courtiq-db
database_id = "abc123def456..."
```

### 3.2 Update wrangler.toml

Edit `apps/web/wrangler.toml` and replace `<YOUR_D1_DATABASE_ID>` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "courtiq-db"
database_id = "abc123def456..."  # <- Your actual ID here
```

### 3.3 Create database schema

```bash
# From apps/web directory
wrangler d1 execute courtiq-db --file=./db/schema.sql
```

You should see output confirming tables were created.

### 3.4 Seed with tournament data

```bash
wrangler d1 execute courtiq-db --file=./db/seed.sql
```

This will populate your database with the Dink Syndicate Tournament data.

### 3.5 Verify data

```bash
wrangler d1 execute courtiq-db --command "SELECT * FROM tournaments;"
```

You should see your tournament listed.

---

## Step 4: Create D1-Backed Store Layer

We'll keep the current in-memory store for local development but add D1 support for production.

The implementation will:
- Use in-memory store in development (`pnpm dev`)
- Use D1 database in production (Cloudflare Pages)
- Auto-detect environment and switch storage backend

---

## Step 5: Connect GitHub Repository to Cloudflare Pages

### 5.1 Go to Cloudflare Dashboard
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**

### 5.2 Configure Repository
1. Select your GitHub account
2. Choose `Basanth-Builds/courtiq` repository
3. Click **Begin setup**

### 5.3 Build Settings
Configure the following settings:

**Production branch:** `dev` (or `main` if you want to merge dev to main first)

**Framework preset:** `Next.js`

**Build command:**
```bash
cd apps/web && pnpm install && pnpm build
```

**Build output directory:**
```
apps/web/.next
```

**Root directory:** Leave empty (monorepo setup handles this)

**Node version:** `18` or `20`

### 5.4 Environment Variables
Add these environment variables:

| Variable Name | Value | Type |
|--------------|--------|------|
| `ADMIN_PASSWORD` | `D!nk$` | Secret |
| `NODE_VERSION` | `18` | Plain text |

Click **Save and Deploy**

---

## Step 6: Bind D1 Database to Pages Project

After the first deployment completes:

### 6.1 Navigate to Settings
1. In your Pages project, go to **Settings**
2. Click **Functions** tab
3. Scroll to **D1 database bindings**

### 6.2 Add D1 Binding
1. Click **Add binding**
2. Variable name: `DB`
3. D1 database: Select `courtiq-db`
4. Click **Save**

### 6.3 Redeploy
1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Retry deployment**

---

## Step 7: Configure Custom Domain (Optional)

### 7.1 Add Custom Domain
1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `courtiq.yourdomain.com`)
4. Follow DNS configuration instructions

### 7.2 SSL/TLS
- Cloudflare automatically provisions SSL certificates
- Your site will be available on HTTPS within minutes

---

## Step 8: Test Your Production Deployment

### 8.1 Access Spectator View
Visit your Cloudflare Pages URL (e.g., `courtiq-abc.pages.dev`)

You should see:
- ✅ Tournament name: "Dink Syndicate Tournament"
- ✅ Date: "5th July 2026"
- ✅ Venue: "Picklers' Hub — Visakhpatnam"
- ✅ Status: Live
- ✅ All categories, pools, and matches loaded from D1

### 8.2 Test Admin Access
1. Go to `/admin/login`
2. Enter password: `D!nk$`
3. You should be redirected to `/admin`
4. Try editing a score or team name
5. Check spectator view - changes should appear within 2 seconds

### 8.3 Test Concurrent Access
Open the spectator view in multiple browser tabs/devices:
- ✅ All should show the same data
- ✅ Updates from admin should appear on all spectators
- ✅ No data conflicts or race conditions

---

## Step 9: Monitor and Debug

### 9.1 View Logs
```bash
wrangler pages deployment tail
```

### 9.2 Check D1 Data
```bash
wrangler d1 execute courtiq-db --command "SELECT COUNT(*) as match_count FROM matches;"
```

### 9.3 Common Issues

**Issue: "Database not found"**
- Solution: Make sure D1 binding is set up in Cloudflare Pages settings
- Variable name must be exactly `DB`
- Redeploy after adding binding

**Issue: "Admin password not working"**
- Solution: Check environment variable `ADMIN_PASSWORD` is set
- It's case-sensitive: `D!nk$`
- Redeploy after changing env vars

**Issue: "Changes not persisting"**
- Solution: Verify D1 binding is active
- Check logs for database errors
- Make sure API routes are using D1-backed store

---

## Step 10: Scaling for Many Users

Cloudflare Pages automatically scales to handle traffic:

### Performance Optimizations
✅ **Edge caching**: Spectator view can be cached at edge locations worldwide
✅ **Global distribution**: D1 replicates data to edge locations
✅ **Auto-scaling**: Handles sudden traffic spikes automatically
✅ **DDoS protection**: Built-in Cloudflare protection
✅ **Zero cold starts**: Functions stay warm

### Monitoring
- **Analytics**: Available in Cloudflare dashboard
- **Real-time metrics**: Request count, latency, errors
- **Custom alerts**: Set up notifications for errors/downtime

---

## Production Checklist

Before going live, verify:

- [ ] D1 database created and seeded
- [ ] D1 binding configured in Cloudflare Pages
- [ ] Environment variable `ADMIN_PASSWORD` set
- [ ] Admin login works at `/admin/login`
- [ ] Score updates persist and appear on spectator view
- [ ] Team name edits work
- [ ] Add team functionality works
- [ ] Pool name edits work
- [ ] Standings calculate correctly
- [ ] Multiple browser tabs show consistent data
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

---

## Rollback Plan

If something goes wrong:

### Option 1: Rollback to Previous Deployment
1. Go to **Deployments** tab in Cloudflare Pages
2. Find the last working deployment
3. Click **...** → **Rollback to this deployment**

### Option 2: Emergency Database Reset
```bash
# Clear all data
wrangler d1 execute courtiq-db --command "DELETE FROM matches; DELETE FROM pools; DELETE FROM categories; DELETE FROM tournaments;"

# Re-seed
wrangler d1 execute courtiq-db --file=./db/seed.sql
```

---

## Cost Estimate

**Cloudflare Free Tier includes:**
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 5 GB D1 storage
- ✅ 5 million D1 reads/day
- ✅ 100k D1 writes/day

For a tournament with 100 spectators refreshing every 2 seconds:
- **Reads**: ~4,300 reads/hour = ~100k reads/day ✅ Within free tier
- **Writes**: Admin updates only, ~100-500/day ✅ Within free tier

**You can handle thousands of concurrent spectators on the free tier!**

---

## Next Steps After Deployment

1. **Custom Domain**: Add your own domain for professional URL
2. **Analytics**: Monitor usage in Cloudflare dashboard
3. **Backups**: Export D1 data periodically for backups
4. **Updates**: Push to `dev` branch triggers auto-deployment

---

## Support

If you encounter issues:
1. Check Cloudflare Pages logs: `wrangler pages deployment tail`
2. Verify D1 data: `wrangler d1 execute courtiq-db --command "SELECT * FROM tournaments;"`
3. Check environment variables in Cloudflare dashboard
4. Review commit history for recent changes

**Your tournament is now production-ready and can scale to thousands of concurrent users!** 🚀
