-- Migration: add constraints and indexes matching manual changes

-- Ensure users can't be awarded the same badge multiple times at the DB level
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_badge_unique') THEN
    ALTER TABLE user_badges ADD CONSTRAINT user_badge_unique UNIQUE (user_id, badge_id);
  END IF;
END$$;

-- Add foreign key relationships where sensible
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_user') THEN
    ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_session') THEN
    ALTER TABLE transactions ADD CONSTRAINT fk_transactions_session FOREIGN KEY (session_id) REFERENCES sessions(id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audits_session') THEN
    ALTER TABLE audits ADD CONSTRAINT fk_audits_session FOREIGN KEY (session_id) REFERENCES sessions(id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_badges_user') THEN
    ALTER TABLE user_badges ADD CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scenarios_user') THEN
    ALTER TABLE scenarios ADD CONSTRAINT fk_scenarios_user FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END$$;

-- Helpful indexes for common lookup patterns
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_entries(user_id);
