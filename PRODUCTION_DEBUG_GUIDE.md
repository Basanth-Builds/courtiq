# Production Debugging Guide - D1 Database Binding

## 🐛 Issue: Routes Not Seeing D1 Database in Production

### Root Cause
OpenNext + Cloudflare Pages requires accessing environment bindings through a specific context path: `(req as any).cloudflare?.env`

Some routes were using inconsistent patterns:
- ❌ `(req as any).env` (wrong - won't see D1 in production)
- ✅ `(req as any).cloudflare?.env` (correct - sees D1 in production)

---

## ✅ Fixes Applied

### 1. Standardized Environment Access Pattern

**All mutation routes now use:**
```typescript
const env = (req as any).cloudflare?.env as Env | undefined
console.log('[Route Name] D1 database present?', Boolean(env?.DB))
```

### 2. Routes Fixed with Logging

| Route | Old Pattern | Fixed | Logging Added |
|-------|-------------|-------|---------------|
| `/api/scores/pool` | `req.env` ❌ | `req.cloudflare?.env` ✅ | ✅ |
| `/api/scores/match` | Correct ✅ | - | ✅ |
| `/api/scores/match/create` | Correct ✅ | - | ✅ |
| `/api/scores/add-team` | Correct ✅ | - | ✅ |
| `/api/scores/team` | Correct ✅ | - | ✅ |
| `/api/scores/game` | Correct ✅ | - | ✅ |
| `/api/pools` POST | Correct ✅ | - | ✅ |
| `/api/pools` DELETE | Correct ✅ | - | ✅ |
| `/api/scores` GET | Correct ✅ | - | ✅ |
| `/api/courts/manage` | Correct ✅ | - | Already had check |

---

## 🔍 How to Debug in Production

### Step 1: Check Cloudflare Pages Logs

After deploying, go to:
```
Cloudflare Dashboard → Pages → Your Project → Logs (Real-time)
```

### Step 2: Trigger Each Mutation

From your browser console or terminal:

```javascript
// 1. Test GET scores
fetch('/api/scores').then(r => r.json()).then(console.log)
// Check logs for: "[GET Scores] D1 database present? true"

// 2. Test Create Match
fetch('/api/scores/match/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    poolId: 'pool_md35_a',
    team1: 'Test A',
    team2: 'Test B',
    courtNumber: 5
  })
}).then(r => r.json()).then(console.log)
// Check logs for: "[Create Match] D1 database present? true"

// 3. Test Update Score
fetch('/api/scores/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    matchId: 'some-match-id',
    updates: { finalScore: { team1: 11, team2: 9 } }
  })
}).then(r => r.json()).then(console.log)
// Check logs for: "[Update Match] D1 database present? true"

// 4. Test Add Team
fetch('/api/scores/add-team', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    poolId: 'pool_md35_a',
    teamName: 'New Team'
  })
}).then(r => r.json()).then(console.log)
// Check logs for: "[Add Team] D1 database present? true"

// 5. Test Create Pool
fetch('/api/pools', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    categoryId: 'open-singles',
    poolName: 'Pool C'
  })
}).then(r => r.json()).then(console.log)
// Check logs for: "[Create Pool] D1 database present? true"
```

### Step 3: Interpret Results

**If logs show `D1 database present? false`:**

❌ **Problem:** D1 binding not configured correctly

**Solution:** Check `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"  # Must be exactly "DB"
database_name = "courtiq-db"
database_id = "your-database-id-here"
```

**Or in Cloudflare Pages Dashboard:**
```
Settings → Functions → D1 database bindings
Variable name: DB
D1 database: courtiq-db
```

---

**If logs show `D1 database present? true`:**

✅ **Binding is working!**

Check if writes are actually happening:
```bash
wrangler d1 execute courtiq-db --command "SELECT COUNT(*) as count FROM matches"
```

---

## 🧪 Local Development Testing

In development (localhost), logs will show:
```
[GET Scores] D1 database present? false
[Create Match] D1 database present? false
```

This is **EXPECTED** because `cloudflare?.env` is only available in Cloudflare Workers/Pages.

Local development uses the in-memory store fallback.

---

## 📊 Expected Log Output

### Development (localhost):
```
[GET Scores] D1 database present? false
→ Using in-memory store ✅
```

### Production (Cloudflare Pages with D1):
```
[GET Scores] D1 database present? true
→ Using D1 database ✅
```

### Production (Cloudflare Pages WITHOUT D1):
```
[GET Scores] D1 database present? false
→ Using in-memory store (PROBLEM - data won't persist!) ❌
```

---

## 🔧 Troubleshooting Checklist

### Issue: "D1 database present? false" in production

- [ ] Check `wrangler.toml` has correct `[[d1_databases]]` section
- [ ] Verify binding name is exactly `"DB"` (case-sensitive)
- [ ] Confirm D1 database exists: `wrangler d1 list`
- [ ] Check Cloudflare Pages settings → Functions → D1 bindings
- [ ] Redeploy after changing D1 configuration
- [ ] Check deployment logs for D1-related errors

### Issue: "D1 database present? true" but data not persisting

- [ ] Check D1 database has all required tables
- [ ] Run: `wrangler d1 execute courtiq-db --command "SELECT name FROM sqlite_master WHERE type='table'"`
- [ ] Verify schema matches: tournaments, categories, pools, matches, games
- [ ] Check for SQL errors in Cloudflare logs
- [ ] Test writes manually: `wrangler d1 execute courtiq-db --command "INSERT INTO matches ..."`

### Issue: Auth errors (401 Unauthorized)

- [ ] Verify admin login sets `ciq_admin` cookie
- [ ] Check cookie is sent with mutation requests (credentials: 'include')
- [ ] Confirm cookie is httpOnly, secure, sameSite='lax'
- [ ] Test login flow: `/admin/login` → password `D!nk$` → cookie set

---

## 🎯 Quick Verification Script

Create a file `test-production.sh`:

```bash
#!/bin/bash

SITE_URL="https://your-site.pages.dev"

echo "=== Testing Production D1 Binding ==="

# 1. Test GET (should log D1 status)
echo "1. Testing GET /api/scores..."
curl -s "$SITE_URL/api/scores" > /dev/null
echo "   → Check Cloudflare logs for '[GET Scores] D1 database present?'"

# 2. Login as admin
echo "2. Logging in as admin..."
COOKIE=$(curl -s -c - "$SITE_URL/api/auth/admin" \
  -H "Content-Type: application/json" \
  -d '{"password":"D!nk$"}' | grep ciq_admin | awk '{print $7}')

if [ -z "$COOKIE" ]; then
  echo "   ❌ Login failed"
  exit 1
fi
echo "   ✅ Login successful"

# 3. Test match creation
echo "3. Testing match creation..."
RESULT=$(curl -s "$SITE_URL/api/scores/match/create" \
  -H "Content-Type: application/json" \
  -H "Cookie: ciq_admin=$COOKIE" \
  -d '{
    "poolId": "pool_md35_a",
    "team1": "Production Test A",
    "team2": "Production Test B",
    "courtNumber": 99
  }')

if echo "$RESULT" | grep -q "success"; then
  echo "   ✅ Match created"
  echo "   → Check Cloudflare logs for '[Create Match] D1 database present?'"
else
  echo "   ❌ Match creation failed: $RESULT"
fi

echo ""
echo "=== Check Cloudflare Logs Now ==="
echo "All mutation operations should log 'D1 database present? true'"
```

Make executable and run:
```bash
chmod +x test-production.sh
./test-production.sh
```

---

## 🚀 Post-Deployment Checklist

After deploying to production:

1. **Verify D1 Binding:**
   - [ ] All logs show `D1 database present? true`

2. **Test All Mutations:**
   - [ ] Create match works
   - [ ] Update score works
   - [ ] Add team works
   - [ ] Update team name works
   - [ ] Create pool works
   - [ ] Update pool name works

3. **Verify Persistence:**
   - [ ] Create a match in browser A
   - [ ] Refresh browser B - match appears
   - [ ] Close browser A, reopen later
   - [ ] Match still exists (not lost)

4. **Test Real-Time Updates:**
   - [ ] Admin creates match → Spectator sees within 2-3s
   - [ ] Admin updates score → Spectator sees within 2-3s
   - [ ] Multiple spectators all see same data

5. **Clean Up Logs:**
   - [ ] Once verified working, remove diagnostic logs
   - [ ] Or keep for ongoing monitoring

---

## 📝 Removing Diagnostic Logs

Once production is working, you can remove the console.log statements:

```bash
# Find all diagnostic logs
grep -rn "console.log.*D1 database present" src/app/api/

# Remove them (or comment out)
# They're useful for debugging but not needed in production long-term
```

**Or keep them!** They're harmless and useful for monitoring.

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Cloudflare logs show `D1 database present? true` for all routes
2. ✅ Matches created in admin appear in spectator view
3. ✅ Scores persist across browser refreshes
4. ✅ Data survives server restarts (because it's in D1, not memory)
5. ✅ Multiple users see the same real-time data

---

**Created:** 2026-07-05  
**For:** CourtIQ Production Deployment  
**Status:** Ready for debugging
