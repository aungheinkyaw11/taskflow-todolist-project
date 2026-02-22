-- ── STEP 1: Create users table ───────────────────────
-- Must be created BEFORE tasks (tasks references users)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,  -- must be unique
  password    VARCHAR(255) NOT NULL,          -- bcrypt hash, never plain text!
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ── STEP 2: Create tasks table ───────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50)  DEFAULT 'todo'
                           CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    VARCHAR(50)  DEFAULT 'medium'
                           CHECK (priority IN ('low', 'medium', 'high')),
  due_date    DATE,
  user_id     INTEGER      REFERENCES users(id) ON DELETE CASCADE,
  -- ON DELETE CASCADE: if user is deleted, their tasks are deleted too
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id  ON tasks(user_id);


-- ── Done ─────────────────────────────────────────────
SELECT 'Database setup complete! Tables: users, tasks' AS result;