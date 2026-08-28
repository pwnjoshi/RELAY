-- ============================================================
-- RELAY AUTONOMOUS VOICE OPERATIONS — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- 1. ORGANIZATIONS
-- Top-level tenant entity (e.g. "Apex Health Dental Group")
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id          TEXT PRIMARY KEY DEFAULT ('org_' || replace(gen_random_uuid()::text, '-', '')),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'starter',  -- starter | growth | enterprise
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 2. CLINIC LOCATIONS
-- Physical or virtual clinic sites under an organization
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinic_locations (
  id                      TEXT PRIMARY KEY DEFAULT ('loc_' || replace(gen_random_uuid()::text, '-', '')),
  org_id                  TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  address                 TEXT,
  phone                   TEXT,
  timezone                TEXT DEFAULT 'America/New_York',
  hours                   JSONB DEFAULT '{}',         -- { "mon": "9am-5pm", ... }
  services                TEXT[] DEFAULT '{}',
  average_ticket_value    NUMERIC(10,2) DEFAULT 0,
  on_call_doctor          TEXT,
  on_call_doctor_phone    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. DEPARTMENTS
-- Routing units within a clinic (General, Ortho, Emergency…)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id                  TEXT PRIMARY KEY,
  org_id              TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  location_id         TEXT REFERENCES clinic_locations(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  code                TEXT NOT NULL,
  description         TEXT,
  head_doctor         TEXT,
  phone_extension     TEXT,
  active_calls_count  INTEGER DEFAULT 0,
  monthly_quota       INTEGER DEFAULT 1000,
  monthly_used        INTEGER DEFAULT 0,
  allowed_roles       TEXT[] DEFAULT '{owner,dept_admin,operator}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 4. USERS / TEAM MEMBERS
-- Staff accounts with RBAC roles
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY DEFAULT ('usr_' || replace(gen_random_uuid()::text, '-', '')),
  org_id          TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  role            TEXT NOT NULL DEFAULT 'operator',   -- owner | dept_admin | operator | media_pr
  department_ids  TEXT[] DEFAULT '{}',
  avatar_url      TEXT,
  status          TEXT NOT NULL DEFAULT 'active',     -- active | invited | suspended
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 5. CALLS
-- Every intercepted or outbound call handled by CALL-E
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calls (
  id                  TEXT PRIMARY KEY DEFAULT ('call_' || replace(gen_random_uuid()::text, '-', '')),
  run_id              TEXT,                                             -- CALL-E run/trace ID
  org_id              TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  location_id         TEXT,
  department_id       TEXT REFERENCES departments(id) ON DELETE SET NULL,
  phone_number        TEXT NOT NULL,
  patient_name        TEXT NOT NULL DEFAULT 'Unknown Caller',
  call_type           TEXT NOT NULL DEFAULT 'inbound_overflow',         -- inbound_overflow | outbound_recall | batch_followup
  status              TEXT NOT NULL DEFAULT 'planning',                 -- planning | running | completed | failed
  language            TEXT DEFAULT 'en',
  custom_goal         TEXT,
  summary             TEXT,
  structured_outcome  JSONB,                                            -- StructuredCallOutcome shape
  recovered_revenue   NUMERIC(10,2) DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_calls_org_created ON calls(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_department ON calls(department_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- ────────────────────────────────────────────────────────────
-- 6. APPOINTMENTS
-- Bookings made by CALL-E during a call
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                TEXT PRIMARY KEY DEFAULT ('appt_' || replace(gen_random_uuid()::text, '-', '')),
  call_id           TEXT REFERENCES calls(id) ON DELETE SET NULL,
  org_id            TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  department_id     TEXT REFERENCES departments(id) ON DELETE SET NULL,
  patient_name      TEXT NOT NULL,
  phone_number      TEXT NOT NULL,
  service_type      TEXT,
  scheduled_at      TIMESTAMPTZ,
  status            TEXT DEFAULT 'booked',               -- booked | confirmed | cancelled | no_show
  calendar_event_id TEXT,                                -- Google Calendar / EHR event ID
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 7. BATCH CAMPAIGNS
-- Outbound call campaigns uploaded by staff
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch_campaigns (
  id              TEXT PRIMARY KEY DEFAULT ('camp_' || replace(gen_random_uuid()::text, '-', '')),
  org_id          TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  department_id   TEXT REFERENCES departments(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft',         -- draft | processing | completed | paused
  total_contacts  INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  booked_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 8. BATCH CAMPAIGN ITEMS (individual contacts)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch_items (
  id            TEXT PRIMARY KEY DEFAULT ('bitem_' || replace(gen_random_uuid()::text, '-', '')),
  campaign_id   TEXT REFERENCES batch_campaigns(id) ON DELETE CASCADE,
  patient_name  TEXT NOT NULL,
  phone_number  TEXT NOT NULL,
  department_id TEXT,
  reason        TEXT,
  custom_goal   TEXT,
  language      TEXT DEFAULT 'en',
  status        TEXT NOT NULL DEFAULT 'queued',          -- queued | dialing | completed | failed
  call_id       TEXT REFERENCES calls(id) ON DELETE SET NULL,
  outcome       TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 9. AUDIT LOGS
-- Tamper-evident trail of all mutations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  action      TEXT NOT NULL,                             -- INSERT | UPDATE | DELETE
  old_data    JSONB,
  new_data    JSONB,
  actor_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 10. CALENDAR CONNECTIONS (Google Calendar per Branch)
-- Multi-location OAuth 2.0 token persistence with AES-256 encrypted refresh tokens
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_connections (
  id                       TEXT PRIMARY KEY DEFAULT ('calconn_' || replace(gen_random_uuid()::text, '-', '')),
  branch_id                TEXT UNIQUE NOT NULL,
  user_id                  TEXT REFERENCES users(id) ON DELETE SET NULL,
  google_email             TEXT,
  encrypted_refresh_token  TEXT NOT NULL,
  calendar_id              TEXT NOT NULL DEFAULT 'primary',
  access_token             TEXT,
  access_token_expires_at  BIGINT,
  config_json              JSONB DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calconn_branch ON calendar_connections(branch_id);

-- ────────────────────────────────────────────────────────────
-- 11. IDEMPOTENCY KEYS (Durable Request Deduplication)
-- Prevents double-submissions and duplicate telephony dispatches
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key           TEXT PRIMARY KEY,
  response_json JSONB NOT NULL,
  status_code   INTEGER NOT NULL DEFAULT 200,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_keys(created_at);

-- ────────────────────────────────────────────────────────────
-- 12. REALTIME — subscribe to live call events on the dashboard
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE batch_items;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_connections;
