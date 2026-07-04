-- Enhanced seed data with games, courts, and schedule
-- Run after schema-enhanced.sql

-- Clear all data (for fresh start)
DELETE FROM brackets;
DELETE FROM player_stats;
DELETE FROM players;
DELETE FROM schedule_slots;
DELETE FROM courts;
DELETE FROM games;
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

-- Insert courts
INSERT INTO courts (id, tournament_id, court_number, name, status) VALUES
  ('court_1', 'trn_demo', 1, 'Court 1', 'AVAILABLE'),
  ('court_2', 'trn_demo', 2, 'Court 2', 'AVAILABLE'),
  ('court_3', 'trn_demo', 3, 'Court 3', 'AVAILABLE'),
  ('court_4', 'trn_demo', 4, 'Court 4', 'AVAILABLE');

-- Sample matches for Open Singles Pool A
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_s_a_1', 'trn_demo', 'cat_singles', 'pool_singles_a', 'Rahul Sharma', 'Vikram Patel', 'POOL', 'CONFIRMED', 2, 0, 1),
  ('match_s_a_2', 'trn_demo', 'cat_singles', 'pool_singles_a', 'Amit Kumar', 'Suresh Reddy', 'POOL', 'CONFIRMED', 2, 1, 2),
  ('match_s_a_3', 'trn_demo', 'cat_singles', 'pool_singles_a', 'Rahul Sharma', 'Amit Kumar', 'POOL', 'IN_PROGRESS', 1, 0, 1);

-- Games for completed match (match_s_a_1: Rahul 2-0 Vikram)
INSERT INTO games (id, match_id, game_number, team1_score, team2_score, status, winner) VALUES
  ('game_s_a_1_1', 'match_s_a_1', 1, 11, 7, 'COMPLETED', 'team1'),
  ('game_s_a_1_2', 'match_s_a_1', 2, 11, 9, 'COMPLETED', 'team1');

-- Games for completed match (match_s_a_2: Amit 2-1 Suresh)
INSERT INTO games (id, match_id, game_number, team1_score, team2_score, status, winner) VALUES
  ('game_s_a_2_1', 'match_s_a_2', 1, 11, 6, 'COMPLETED', 'team1'),
  ('game_s_a_2_2', 'match_s_a_2', 2, 9, 11, 'COMPLETED', 'team2'),
  ('game_s_a_2_3', 'match_s_a_2', 3, 11, 8, 'COMPLETED', 'team1');

-- Games for in-progress match (match_s_a_3: Rahul 1-0 Amit, game 2 in progress)
INSERT INTO games (id, match_id, game_number, team1_score, team2_score, status, winner) VALUES
  ('game_s_a_3_1', 'match_s_a_3', 1, 11, 5, 'COMPLETED', 'team1'),
  ('game_s_a_3_2', 'match_s_a_3', 2, 8, 6, 'IN_PROGRESS', NULL);

-- Sample matches for Open Singles Pool B
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_s_b_1', 'trn_demo', 'cat_singles', 'pool_singles_b', 'Priya Nair', 'Anjali Gupta', 'POOL', 'SCHEDULED', NULL, NULL, NULL),
  ('match_s_b_2', 'trn_demo', 'cat_singles', 'pool_singles_b', 'Neha Singh', 'Kavita Rao', 'POOL', 'SCHEDULED', NULL, NULL, NULL);

-- Sample matches for Open Doubles Pool A
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_d_a_1', 'trn_demo', 'cat_doubles', 'pool_doubles_a', 'Team Fire', 'Team Ice', 'POOL', 'CONFIRMED', 2, 0, 3),
  ('match_d_a_2', 'trn_demo', 'cat_doubles', 'pool_doubles_a', 'Team Thunder', 'Team Lightning', 'POOL', 'CONFIRMED', 2, 1, 4),
  ('match_d_a_3', 'trn_demo', 'cat_doubles', 'pool_doubles_a', 'Team Fire', 'Team Thunder', 'POOL', 'SCHEDULED', NULL, NULL, NULL);

-- Games for doubles matches
INSERT INTO games (id, match_id, game_number, team1_score, team2_score, status, winner) VALUES
  ('game_d_a_1_1', 'match_d_a_1', 1, 11, 4, 'COMPLETED', 'team1'),
  ('game_d_a_1_2', 'match_d_a_1', 2, 11, 7, 'COMPLETED', 'team1'),
  ('game_d_a_2_1', 'match_d_a_2', 1, 11, 8, 'COMPLETED', 'team1'),
  ('game_d_a_2_2', 'match_d_a_2', 2, 7, 11, 'COMPLETED', 'team2'),
  ('game_d_a_2_3', 'match_d_a_2', 3, 11, 9, 'COMPLETED', 'team1');

-- Sample matches for Open Doubles Pool B
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_d_b_1', 'trn_demo', 'cat_doubles', 'pool_doubles_b', 'Team Alpha', 'Team Beta', 'POOL', 'SCHEDULED', NULL, NULL, NULL),
  ('match_d_b_2', 'trn_demo', 'cat_doubles', 'pool_doubles_b', 'Team Gamma', 'Team Delta', 'POOL', 'SCHEDULED', NULL, NULL, NULL);

-- Sample matches for Open Doubles 3.8 Pool A
INSERT INTO matches (id, tournament_id, category_id, pool_id, team1, team2, stage, status, team1_score, team2_score, court_number) VALUES
  ('match_d38_a_1', 'trn_demo', 'cat_doubles_38', 'pool_doubles_38_a', 'Team Phoenix', 'Team Dragon', 'POOL', 'CONFIRMED', 2, 1, 1),
  ('match_d38_a_2', 'trn_demo', 'cat_doubles_38', 'pool_doubles_38_a', 'Team Tiger', 'Team Lion', 'POOL', 'IN_PROGRESS', 1, 1, 2);

-- Games for doubles 3.8 matches
INSERT INTO games (id, match_id, game_number, team1_score, team2_score, status, winner) VALUES
  ('game_d38_a_1_1', 'match_d38_a_1', 1, 11, 9, 'COMPLETED', 'team1'),
  ('game_d38_a_1_2', 'match_d38_a_1', 2, 9, 11, 'COMPLETED', 'team2'),
  ('game_d38_a_1_3', 'match_d38_a_1', 3, 11, 7, 'COMPLETED', 'team1'),
  ('game_d38_a_2_1', 'match_d38_a_2', 1, 11, 6, 'COMPLETED', 'team1'),
  ('game_d38_a_2_2', 'match_d38_a_2', 2, 9, 11, 'COMPLETED', 'team2'),
  ('game_d38_a_2_3', 'match_d38_a_2', 3, 7, 5, 'IN_PROGRESS', NULL);

-- Schedule slots (matches scheduled throughout the day)
INSERT INTO schedule_slots (id, tournament_id, match_id, court_id, start_time, duration_minutes, status) VALUES
  ('slot_1', 'trn_demo', 'match_s_a_1', 'court_1', '2026-07-05T09:00:00+05:30', 30, 'COMPLETED'),
  ('slot_2', 'trn_demo', 'match_s_a_2', 'court_2', '2026-07-05T09:00:00+05:30', 30, 'COMPLETED'),
  ('slot_3', 'trn_demo', 'match_d_a_1', 'court_3', '2026-07-05T09:00:00+05:30', 30, 'COMPLETED'),
  ('slot_4', 'trn_demo', 'match_d_a_2', 'court_4', '2026-07-05T09:00:00+05:30', 30, 'COMPLETED'),
  ('slot_5', 'trn_demo', 'match_s_a_3', 'court_1', '2026-07-05T09:30:00+05:30', 30, 'IN_PROGRESS'),
  ('slot_6', 'trn_demo', 'match_d38_a_2', 'court_2', '2026-07-05T09:30:00+05:30', 30, 'IN_PROGRESS'),
  ('slot_7', 'trn_demo', 'match_s_b_1', 'court_3', '2026-07-05T10:00:00+05:30', 30, 'SCHEDULED'),
  ('slot_8', 'trn_demo', 'match_s_b_2', 'court_4', '2026-07-05T10:00:00+05:30', 30, 'SCHEDULED');

-- Update court current matches
UPDATE courts SET current_match_id = 'match_s_a_3', status = 'IN_USE' WHERE id = 'court_1';
UPDATE courts SET current_match_id = 'match_d38_a_2', status = 'IN_USE' WHERE id = 'court_2';

-- Players (for stats tracking)
INSERT INTO players (id, tournament_id, name, category_id, pool_id, seed) VALUES
  ('player_1', 'trn_demo', 'Rahul Sharma', 'cat_singles', 'pool_singles_a', 1),
  ('player_2', 'trn_demo', 'Vikram Patel', 'cat_singles', 'pool_singles_a', 2),
  ('player_3', 'trn_demo', 'Amit Kumar', 'cat_singles', 'pool_singles_a', 3),
  ('player_4', 'trn_demo', 'Suresh Reddy', 'cat_singles', 'pool_singles_a', 4);
