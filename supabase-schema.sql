-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('referee', 'organizer', 'player', 'audience')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  organizer UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  team1_players UUID[] NOT NULL,
  team2_players UUID[] NOT NULL,
  referee UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'live', 'completed')) DEFAULT 'scheduled',
  score_team1 INTEGER DEFAULT 0,
  score_team2 INTEGER DEFAULT 0,
  current_game INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create points table
CREATE TABLE points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  scoring_team INTEGER CHECK (scoring_team IN (1, 2)) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tournaments policies
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Organizers can create tournaments" ON tournaments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
);
CREATE POLICY "Organizers can update own tournaments" ON tournaments FOR UPDATE USING (
  organizer = auth.uid()
);

-- Matches policies
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Organizers can manage matches for their tournaments" ON matches FOR ALL USING (
  EXISTS (SELECT 1 FROM tournaments WHERE id = tournament_id AND organizer = auth.uid())
);
CREATE POLICY "Referees can update assigned matches" ON matches FOR UPDATE USING (
  referee = auth.uid()
);

-- Points policies
CREATE POLICY "Anyone can view points" ON points FOR SELECT USING (true);
CREATE POLICY "Referees can insert points for their matches" ON points FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM matches WHERE id = match_id AND referee = auth.uid())
);

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_referee ON matches(referee);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_points_match ON points(match_id);
CREATE INDEX idx_points_timestamp ON points(timestamp);