# CourtIQ - Tournament Management System

A comprehensive tournament management platform with real-time scoring, built with Next.js, Supabase, and Tailwind CSS.

## Features

### Authentication
- **Phone OTP Login** - SMS-based authentication
- **Google OAuth** - Social login integration  
- **Email Magic Link** - Passwordless email authentication
- **Role-based Access** - 4 user roles: Referee, Organizer, Player, Audience

### User Roles & Dashboards

#### Organizer Dashboard
- Create and manage tournaments
- Add players to tournaments
- Create match fixtures
- Assign referees to matches
- View live scores and tournament progress
- Tournament overview with statistics

#### Referee Dashboard  
- View assigned matches
- Live scoring interface with real-time updates
- Start/end matches
- Add points with undo functionality
- Match management controls

#### Player Dashboard
- View tournament participation
- Track match history and statistics
- Win/loss record tracking
- Upcoming match schedule
- Live match viewing

#### Audience Dashboard
- Explore active tournaments
- Watch live matches in real-time
- View tournament brackets and results
- Follow favorite tournaments

### Real-time Features
- **Live Scoring** - Real-time score updates using Supabase Realtime
- **Match Status Updates** - Live match status changes
- **Point-by-point Tracking** - Detailed scoring history
- **Auto-refresh** - Automatic updates across all connected devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, ShadCN UI Components
- **Authentication**: Supabase Auth (Phone OTP, OAuth, Magic Links)
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: Supabase Realtime subscriptions

## Database Schema

### Tables
- `profiles` - User profiles with roles
- `tournaments` - Tournament information
- `matches` - Match fixtures and results  
- `points` - Point-by-point scoring history

### Key Features
- Row Level Security (RLS) policies
- Real-time subscriptions
- UUID primary keys
- Proper foreign key relationships

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd courtiq
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

**📋 Complete Setup Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

**Quick Setup**:
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the SQL schema from `supabase-schema.sql` in SQL Editor
4. Configure authentication providers (Email, Phone, Google OAuth)
5. Enable Realtime for `matches` and `points` tables

### 4. Test Supabase Connection (Optional)
```bash
npm run test:supabase
```

This will verify your Supabase setup is working correctly.

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── (auth)/
│   ├── login/              # Login page with multiple auth options
│   ├── select-role/        # Role selection after signup
│   └── auth/callback/      # OAuth callback handler
├── organizer/
│   ├── dashboard/          # Organizer main dashboard
│   └── tournaments/        # Tournament management
├── referee/
│   ├── dashboard/          # Referee dashboard
│   └── match/[id]/         # Live scoring interface
├── player/
│   └── dashboard/          # Player dashboard
├── audience/
│   ├── explore/            # Tournament discovery
│   ├── tournament/[id]/    # Tournament viewing
│   └── match/[id]/         # Live match viewing
└── components/
    ├── ui/                 # ShadCN UI components
    ├── dashboard-layout.tsx # Main dashboard layout
    ├── tournament-matches.tsx # Match display component
    └── ...

lib/
├── supabase.ts            # Supabase client configuration
├── auth.ts                # Authentication utilities
└── utils.ts               # Utility functions

middleware.ts              # Auth middleware for route protection
```

## Key Features Implementation

### Real-time Scoring
- Uses Supabase Realtime for live updates
- Point-by-point tracking in `points` table
- Automatic score calculation and display
- Undo functionality for referees

### Role-based Access Control
- Middleware-based route protection
- Database-level RLS policies
- Role-specific UI components
- Proper authorization checks

### Responsive Design
- Mobile-first approach
- Athletic/sporty theme with neon accents
- Dark mode support
- Touch-friendly scoring interface

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
