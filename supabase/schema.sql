-- Sessions table: stores game sessions and KPIs
create table if not exists sessions (
  id uuid primary key,
  user_id text,
  kpi jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI logs table: store user queries and assistant responses for auditing
create table if not exists ai_logs (
  id uuid primary key,
  user_id text,
  prompt text,
  response text,
  created_at timestamptz default now()
);

-- Users table (optional metadata)
create table if not exists users (
  id text primary key,
  email text,
  created_at timestamptz default now()
);

-- Suppliers: store supplier metadata and last vetting score
create table if not exists suppliers (
  id uuid primary key,
  name text,
  country text,
  metadata jsonb,
  last_risk_score numeric,
  last_vetted_at timestamptz
);

-- Audits: records of audits/checks performed
create table if not exists audits (
  id uuid primary key,
  session_id uuid,
  user_id text,
  findings jsonb,
  score numeric,
  created_at timestamptz default now()
);

-- Scenarios: saved scenario simulations
create table if not exists scenarios (
  id uuid primary key,
  user_id text,
  name text,
  input jsonb,
  result jsonb,
  created_at timestamptz default now()
);

-- Transactions: record of in-game actions affecting KPIs
create table if not exists transactions (
  id uuid primary key,
  session_id uuid,
  user_id text,
  action text,
  delta jsonb,
  created_at timestamptz default now()
);

-- Badges metadata and user awards
create table if not exists badges (
  id text primary key,
  name text not null,
  description text,
  icon text,
  created_at timestamptz default now()
);

create table if not exists user_badges (
  id uuid primary key,
  user_id text,
  badge_id text references badges(id),
  awarded_at timestamptz default now()
);

-- Leaderboard entries (snapshot of user score)
create table if not exists leaderboard_entries (
  id uuid primary key,
  user_id text,
  esg_score numeric,
  created_at timestamptz default now()
);

-- Seed some badge metadata (no-op if present)
insert into badges (id, name, description, icon)
select 'waste_sorter_master','Waste Sorting Master','Successfully sorted waste items in the Environment mini-game','recycle'
where not exists (select 1 from badges where id='waste_sorter_master');

insert into badges (id, name, description, icon)
select 'net_zero_hero','Net Zero Hero','Achieved ESG score >= 80','star'
where not exists (select 1 from badges where id='net_zero_hero');

insert into badges (id, name, description, icon)
select 'ethics_enforcer','Ethics Enforcer','Achieved ESG score >= 90','shield'
where not exists (select 1 from badges where id='ethics_enforcer');

insert into badges (id, name, description, icon)
select 'emissions_optimizer','Emissions Optimizer','Optimized emissions in the Environment module','leaf'
where not exists (select 1 from badges where id='emissions_optimizer');

-- Migration additions: add missing constraints and indexes to improve integrity and performance
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
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_transactions_session_id on transactions(session_id);
create index if not exists idx_scenarios_user_id on scenarios(user_id);
create index if not exists idx_leaderboard_user_id on leaderboard_entries(user_id);
