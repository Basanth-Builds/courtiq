# Supabase Setup Guide for CourtIQ

This guide will walk you through setting up Supabase for the CourtIQ tournament management system.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `courtiq` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

## Step 2: Get Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Keys** → **anon** **public** key (this is a long JWT token starting with `eyJ...`)

⚠️ **Important**: Make sure you copy the **anon** key, not the service_role key!

3. Update your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzU4MzQ3NCwiZXhwIjoxOTUzMTU5NDc0fQ.example-key-this-should-be-much-longer
```

**Key Identification**:
- ✅ **anon key**: Long JWT token (200+ characters), starts with `eyJ`, safe for client-side
- ❌ **service_role key**: Also long, but should NEVER be used in frontend code

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click "Run" to execute the schema

This will create:
- All necessary tables (`profiles`, `tournaments`, `matches`, `points`)
- Row Level Security (RLS) policies
- Database functions and triggers
- Proper indexes for performance

## Step 4: Configure Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure **Email Templates** (optional):
   - Customize the magic link email template
   - Set your app name and branding

### Enable Phone Authentication (SMS OTP)
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, enable **Phone**
3. Configure SMS Provider:
   - **Recommended**: Twilio
   - Add your Twilio credentials:
     - Account SID
     - Auth Token
     - Phone Number
   - Test with your phone number first

### Enable Google OAuth
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, enable **Google**
3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
   - Copy Client ID and Client Secret to Supabase

## Step 5: Configure Site URL and Redirect URLs

1. Go to **Authentication** → **Settings**
2. Set **Site URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

## Step 6: Set Up Row Level Security Policies

The schema file includes RLS policies, but verify they're active:

1. Go to **Authentication** → **Policies**
2. Ensure policies exist for all tables:
   - `profiles`: Users can view all, update own
   - `tournaments`: Public read, organizers can create/update own
   - `matches`: Public read, organizers manage own tournaments, referees update assigned matches
   - `points`: Public read, referees can insert for their matches

## Step 7: Test Database Connection

1. Go to **Table Editor**
2. You should see all tables: `profiles`, `tournaments`, `matches`, `points`
3. Try inserting a test record in `profiles` table:
   ```sql
   INSERT INTO profiles (id, name, role) 
   VALUES ('test-id', 'Test User', 'audience');
   ```

## Step 8: Configure Realtime (for Live Scoring)

1. Go to **Database** → **Replication**
2. Enable realtime for these tables:
   - `matches` ✅
   - `points` ✅
3. This enables live updates for scoring

## Step 9: Environment Variables Summary

Your final `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 10: Test Authentication Flow

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Get Started" → should redirect to login
4. Test each authentication method:
   - **Email Magic Link**: Enter email, check inbox
   - **Phone OTP**: Enter phone, check SMS
   - **Google OAuth**: Click Google button

## Troubleshooting

### Common Issues:

**1. "Invalid API Key" Error**
- Double-check your API key in `.env.local`
- Ensure you're using the `anon` key, not the `service_role` key

**2. "Not authorized" Error**
- Check RLS policies are properly set up
- Verify user has correct role in `profiles` table

**3. OAuth Redirect Error**
- Verify redirect URLs in Supabase settings
- Check Google OAuth configuration

**4. SMS Not Working**
- Verify Twilio credentials
- Check phone number format (include country code)
- Ensure Twilio account has sufficient credits

**5. Magic Link Not Working**
- Check spam folder
- Verify email template configuration
- Ensure site URL is correct

### Database Issues:

**1. Tables Not Created**
- Re-run the schema SQL
- Check for SQL syntax errors in the editor

**2. RLS Blocking Queries**
- Temporarily disable RLS for testing
- Check policy conditions match your use case

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**:
   - Set production Supabase URL
   - Use production domain in auth settings

2. **Configure Production OAuth**:
   - Add production redirect URLs
   - Update Google OAuth settings

3. **Review Security**:
   - Audit RLS policies
   - Review API key usage
   - Enable additional security features

4. **Performance**:
   - Review database indexes
   - Monitor query performance
   - Set up database backups

## Support

- **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)