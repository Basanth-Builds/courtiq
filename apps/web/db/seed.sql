-- Seed data for Dink Syndicate Tournament
-- Run this with: wrangler d1 execute courtiq-db --file=./db/seed.sql

-- Clear existing data (optional, for fresh start)
DELETE FROM matches;
DELETE FROM pools;
DELETE FROM categories;
DELETE FROM tournaments;

-- Insert tournament
INSERT INTO tournaments (id, slug, name, venue, date, status) VALUES
  ('trn_demo', 'dink-syndicate-2026', 'Dink Syndicate Tournament', 'Picklers'' Hub — Visakhpatnam', '2026-07-05', 'ACTIVE');

-- Insert categories
INSERT INTO categories (id, tournament_id, name, format) VALUES
  ('cat_singles', 'trn_demo', 'Open Singles', 'SINGLES'),
  ('cat_doubles', 'trn_demo', 'Open Doubles', 'DOUBLES'),
  ('cat_doubles_38', 'trn_demo', 'Open Doubles 3.8', 'DOUBLES');

-- Insert pools for Open Singles
INSERT INTO pools (id, category_id, name) VALUES
  ('pool_singles_a', 'cat_singles', 'Pool A'),
  ('pool_singles_b', 'cat_singles', 'Pool B');

-- Insert pools for Open Doubles
INSERT INTO pools (id, category_id, name) VALUES
  ('pool_doubles_a', 'cat_doubles', 'Pool A'),
  ('pool_doubles_b', 'cat_doubles', 'Pool B');

-- Insert pools for Open Doubles 3.8
INSERT INTO pools (id, category_id, name) VALUES
  ('pool_doubles_38_a', 'cat_doubles_38', 'Pool A');

-- Sample matches for Open Singles Pool A
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_s_a_1', 'trn_demo', 'cat_singles', 'pool_singles_a', 'Player A', 'Player B', 'POOL', 'CONFIRMED', 11, 9, 1),
  ('match_s_a_2', 'trn_demo', 'cat_singles', 'pool_singles_a', 'Player C', 'Player D', 'POOL', 'CONFIRMED', 11, 7, 2),
  ('match_s_a_3', 'trn_demo', 'cat_singles', 'pool_singles_a', 'Player A', 'Player C', 'POOL', 'IN_PROGRESS', NULL, NULL, 1);

-- Sample matches for Open Singles Pool B
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score) VALUES
  ('match_s_b_1', 'trn_demo', 'cat_singles', 'pool_singles_b', 'Player E', 'Player F', 'POOL', 'SCHEDULED', NULL, NULL),
  ('match_s_b_2', 'trn_demo', 'cat_singles', 'pool_singles_b', 'Player G', 'Player H', 'POOL', 'SCHEDULED', NULL, NULL);

-- Sample matches for Open Doubles Pool A
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_d_a_1', 'trn_demo', 'cat_doubles', 'pool_doubles_a', 'Team Red', 'Team Blue', 'POOL', 'CONFIRMED', 11, 8, 1),
  ('match_d_a_2', 'trn_demo', 'cat_doubles', 'pool_doubles_a', 'Team Green', 'Team Yellow', 'POOL', 'CONFIRMED', 11, 6, 2),
  ('match_d_a_3', 'trn_demo', 'cat_doubles', 'pool_doubles_a', 'Team Red', 'Team Green', 'POOL', 'SCHEDULED', NULL, NULL);

-- Sample matches for Open Doubles Pool B
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status) VALUES
  ('match_d_b_1', 'trn_demo', 'cat_doubles', 'pool_doubles_b', 'Team Alpha', 'Team Beta', 'POOL', 'SCHEDULED'),
  ('match_d_b_2', 'trn_demo', 'cat_doubles', 'pool_doubles_b', 'Team Gamma', 'Team Delta', 'POOL', 'SCHEDULED');

-- Sample matches for Open Doubles 3.8 Pool A
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score) VALUES
  ('match_d38_a_1', 'trn_demo', 'cat_doubles_38', 'pool_doubles_38_a', 'Team Phoenix', 'Team Dragon', 'POOL', 'CONFIRMED', 11, 9),
  ('match_d38_a_2', 'trn_demo', 'cat_doubles_38', 'pool_doubles_38_a', 'Team Tiger', 'Team Lion', 'POOL', 'IN_PROGRESS', NULL, NULL);
