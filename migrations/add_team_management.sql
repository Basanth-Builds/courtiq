-- Add teams table for organizing players into teams
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  team_number INTEGER NOT NULL, -- 1-6
  pool INTEGER CHECK (pool IN (1, 2)), -- Pool A or B
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, team_number)
);

-- Add team_players junction table to assign players to teams
CREATE TABLE team_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL, -- For manual entry or from participants
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, participant_id, player_name)
);

-- Add matches table with pool information and match type
CREATE TABLE pool_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  pool INTEGER CHECK (pool IN (1, 2)) NOT NULL,
  match_type TEXT CHECK (match_type IN ('pool', 'semifinal', 'final')) DEFAULT 'pool',
  match_round INTEGER DEFAULT 1, -- For round-robin tracking
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('scheduled', 'live', 'completed')) DEFAULT 'scheduled',
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add doubles_players table to track player pairs for each match
CREATE TABLE doubles_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pool_match_id UUID REFERENCES pool_matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player1_id UUID REFERENCES team_players(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES team_players(id) ON DELETE SET NULL,
  player1_name TEXT NOT NULL, -- Manual entry for flexibility
  player2_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add pool_standings table for caching standings (denormalized for performance)
CREATE TABLE pool_standings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  pool INTEGER CHECK (pool IN (1, 2)) NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_points_for INTEGER DEFAULT 0,
  total_points_against INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, pool)
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubles_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_standings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Organizers can manage teams for their tournaments
CREATE POLICY "Organizers can manage teams" ON teams FOR ALL USING (
  EXISTS (SELECT 1 FROM tournaments WHERE id = tournament_id AND organizer = auth.uid())
);

-- Anyone can view teams
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);

-- Organizers can manage team players
CREATE POLICY "Organizers can manage team players" ON team_players FOR ALL USING (
  EXISTS (SELECT 1 FROM teams 
          INNER JOIN tournaments ON teams.tournament_id = tournaments.id 
          WHERE teams.id = team_id AND tournaments.organizer = auth.uid())
);

-- Anyone can view team players
CREATE POLICY "Anyone can view team players" ON team_players FOR SELECT USING (true);

-- Organizers can manage pool matches
CREATE POLICY "Organizers can manage pool matches" ON pool_matches FOR ALL USING (
  EXISTS (SELECT 1 FROM tournaments WHERE id = tournament_id AND organizer = auth.uid())
);

-- Anyone can view pool matches
CREATE POLICY "Anyone can view pool matches" ON pool_matches FOR SELECT USING (true);

-- Organizers can manage doubles players
CREATE POLICY "Organizers can manage doubles players" ON doubles_players FOR ALL USING (
  EXISTS (SELECT 1 FROM pool_matches 
          INNER JOIN tournaments ON pool_matches.tournament_id = tournaments.id 
          WHERE pool_matches.id = pool_match_id AND tournaments.organizer = auth.uid())
);

-- Anyone can view doubles players
CREATE POLICY "Anyone can view doubles players" ON doubles_players FOR SELECT USING (true);

-- Anyone can view pool standings
CREATE POLICY "Anyone can view pool standings" ON pool_standings FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_teams_pool ON teams(pool);
CREATE INDEX idx_team_players_team ON team_players(team_id);
CREATE INDEX idx_pool_matches_tournament ON pool_matches(tournament_id);
CREATE INDEX idx_pool_matches_pool ON pool_matches(pool);
CREATE INDEX idx_pool_matches_status ON pool_matches(status);
CREATE INDEX idx_doubles_players_match ON doubles_players(pool_match_id);
CREATE INDEX idx_pool_standings_team ON pool_standings(team_id);
CREATE INDEX idx_pool_standings_pool ON pool_standings(pool);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pool_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_doubles_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pool_standings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_teams_updated_at();

CREATE TRIGGER trigger_update_pool_matches_updated_at
  BEFORE UPDATE ON pool_matches
  FOR EACH ROW EXECUTE FUNCTION update_pool_matches_updated_at();

CREATE TRIGGER trigger_update_doubles_players_updated_at
  BEFORE UPDATE ON doubles_players
  FOR EACH ROW EXECUTE FUNCTION update_doubles_players_updated_at();

CREATE TRIGGER trigger_update_pool_standings_updated_at
  BEFORE UPDATE ON pool_standings
  FOR EACH ROW EXECUTE FUNCTION update_pool_standings_updated_at();
