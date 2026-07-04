-- Enhanced Cloudflare D1 Schema for Complete Pickleball Tournament System
-- This adds games scoring, brackets, courts, and schedules to existing schema

-- ============================================================================
-- CORE TABLES (Keep existing)
-- ============================================================================

-- tournaments, categories, pools, matches tables remain as-is

-- ============================================================================
-- NEW TABLES FOR PICKLEBALL FEATURES
-- ============================================================================

-- Games within matches (best of 3 games scoring)
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  game_number INTEGER NOT NULL CHECK (game_number IN (1, 2, 3)),
  team1_score INTEGER DEFAULT 0 CHECK (team1_score >= 0),
  team2_score INTEGER DEFAULT 0 CHECK (team2_score >= 0),
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  winner TEXT CHECK (winner IN ('team1', 'team2')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  UNIQUE(match_id, game_number)
);

-- Courts for match assignments
CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  court_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE')),
  current_match_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (current_match_id) REFERENCES matches(id) ON DELETE SET NULL,
  UNIQUE(tournament_id, court_number)
);

-- Match schedule slots
CREATE TABLE IF NOT EXISTS schedule_slots (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  match_id TEXT,
  court_id TEXT NOT NULL,
  start_time TEXT NOT NULL,  -- ISO 8601 format
  end_time TEXT,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);

-- Player/Team profiles (for stats tracking)
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  pool_id TEXT,
  seed INTEGER,
  email TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE SET NULL
);

-- Player statistics
CREATE TABLE IF NOT EXISTS player_stats (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  points_for INTEGER DEFAULT 0,
  points_against INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(player_id, tournament_id, category_id)
);

-- Bracket structure for playoffs
CREATE TABLE IF NOT EXISTS brackets (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  bracket_type TEXT NOT NULL CHECK (bracket_type IN ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'CONSOLATION')),
  round TEXT NOT NULL CHECK (round IN ('ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'THIRD_PLACE')),
  position INTEGER NOT NULL,
  match_id TEXT,
  seed1 INTEGER,
  seed2 INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
  UNIQUE(tournament_id, category_id, bracket_type, round, position)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_games_match ON games(match_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_courts_tournament ON courts(tournament_id);
CREATE INDEX IF NOT EXISTS idx_courts_status ON courts(status);
CREATE INDEX IF NOT EXISTS idx_schedule_tournament ON schedule_slots(tournament_id);
CREATE INDEX IF NOT EXISTS idx_schedule_court ON schedule_slots(court_id);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedule_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_category ON players(category_id);
CREATE INDEX IF NOT EXISTS idx_players_pool ON players(pool_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_brackets_tournament_category ON brackets(tournament_id, category_id);
CREATE INDEX IF NOT EXISTS idx_brackets_match ON brackets(match_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_game_timestamp 
AFTER UPDATE ON games
BEGIN
  UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_court_timestamp 
AFTER UPDATE ON courts
BEGIN
  UPDATE courts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_schedule_timestamp 
AFTER UPDATE ON schedule_slots
BEGIN
  UPDATE schedule_slots SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_player_stats_timestamp 
AFTER UPDATE ON player_stats
BEGIN
  UPDATE player_stats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- VIEWS FOR CONVENIENCE
-- ============================================================================

-- Match details with games summary
CREATE VIEW IF NOT EXISTS match_details AS
SELECT 
  m.*,
  COUNT(g.id) as total_games,
  SUM(CASE WHEN g.winner = 'team1' THEN 1 ELSE 0 END) as team1_games_won,
  SUM(CASE WHEN g.winner = 'team2' THEN 1 ELSE 0 END) as team2_games_won,
  c.court_number,
  c.name as court_name,
  ss.start_time,
  ss.duration_minutes
FROM matches m
LEFT JOIN games g ON m.id = g.match_id
LEFT JOIN schedule_slots ss ON m.id = ss.match_id
LEFT JOIN courts c ON ss.court_id = c.id
GROUP BY m.id;

-- Live matches (currently in progress)
CREATE VIEW IF NOT EXISTS live_matches AS
SELECT 
  md.*,
  cat.name as category_name,
  cat.format as category_format,
  p.name as pool_name
FROM match_details md
JOIN categories cat ON md.category_id = cat.id
LEFT JOIN pools p ON md.pool_id = p.id
WHERE md.status = 'IN_PROGRESS';

-- Court status board
CREATE VIEW IF NOT EXISTS court_board AS
SELECT 
  c.id,
  c.court_number,
  c.name,
  c.status,
  m.id as current_match_id,
  m.team1,
  m.team2,
  m.stage,
  cat.name as category_name
FROM courts c
LEFT JOIN matches m ON c.current_match_id = m.id
LEFT JOIN categories cat ON m.category_id = cat.id;
