-- QOMUS PRIVATE DATABASE SCHEMA DRAFT
-- Run ONLY on the future dedicated QOMUS PostgreSQL instance.
-- Not deployed, not migrated. Sensitive application data requires encryption
-- before database insertion (keys must not be stored in PostgreSQL).
BEGIN;
CREATE SCHEMA IF NOT EXISTS qomus_private;
REVOKE ALL ON SCHEMA qomus_private FROM PUBLIC;
CREATE TABLE IF NOT EXISTS qomus_private.records (
  record_id text PRIMARY KEY,
  owner_id text NOT NULL,
  record_type text NOT NULL CHECK (record_type IN
    ('user','session','case','document','conversation','notification','consent','setting')),
  ciphertext bytea NOT NULL,
  nonce bytea NOT NULL CHECK (octet_length(nonce)=12),
  authentication_tag bytea NOT NULL CHECK (octet_length(authentication_tag)=16),
  encryption_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_owner_type_idx
  ON qomus_private.records(owner_id, record_type);
CREATE TABLE IF NOT EXISTS qomus_private.security_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category text NOT NULL,
  pseudonymous_source text,
  event_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS security_events_time_idx
  ON qomus_private.security_events(event_at DESC);
ALTER TABLE qomus_private.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE qomus_private.records FORCE ROW LEVEL SECURITY;
-- Intentionally no access policy: deny access until identity-specific policies
-- and distinct least-privilege DB roles are approved and tested.
-- The application MUST NOT connect as an owner/superuser/BYPASSRLS role.
COMMIT;
