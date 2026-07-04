-- Cloudflare D1 Schema for Court IQ Tournament System
-- Run this with: wrangler d1 execute courtiq-db --file=./db/schema.sql

-- Tournament metadata
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  venue TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'REGISTRATION', 'ACTIVE', 'COMPLETED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories (e.g., Open Singles, Open Doubles)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('SINGLES', 'DOUBLES', 'MIXED_DOUBLES')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Pools within categories
CREATE TABLE IF NOT EXISTS pools (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Matches (both pool and playoff matches)
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  pool_id TEXT,
  team1 TEXT NOT NULL,
  team2 TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('POOL', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'THIRD_PLACE')),
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'CONFIRMED')),
  team1_score INTEGER,
  team2_score INTEGER,
  court_number INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_category ON matches(category_id);
CREATE INDEX IF NOT EXISTS idx_matches_pool ON matches(pool_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_categories_tournament ON categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_pools_category ON pools(category_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_tournament_timestamp 
AFTER UPDATE ON tournaments
BEGIN
  UPDATE tournaments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_match_timestamp 
AFTER UPDATE ON matches
BEGIN
  UPDATE matches SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
