-- ── STEP 1: Create dedicated app user ────────────────
-- This user has NO superuser privileges
CREATE USER taskflow_user WITH PASSWORD 'taskflowuserstrongpassword';


-- ── STEP 2: Create database owned by taskflow_user ───
CREATE DATABASE taskflow OWNER taskflow_user;


-- ── STEP 3: Connect to taskflow database ─────────────
\c taskflow


-- ── STEP 4: Grant only what the app needs ────────────
-- NEVER grant superuser or createdb privileges!

-- Allow connecting to the database
GRANT CONNECT ON DATABASE taskflow TO taskflow_user;

-- Allow using the public schema
GRANT USAGE ON SCHEMA public TO taskflow_user;

-- Allow SELECT, INSERT, UPDATE, DELETE on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO taskflow_user;

-- Allow using sequences (needed for SERIAL / auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO taskflow_user;

-- Apply same permissions to future tables automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO taskflow_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO taskflow_user;


-- ── STEP 5: Revoke public access ─────────────────────
-- Extra security: remove default public schema access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO taskflow_user;


-- ── Verify ───────────────────────────────────────────
SELECT 'User taskflow_user created with limited permissions on taskflow database' AS result;