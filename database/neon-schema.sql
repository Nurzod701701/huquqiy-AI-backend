-- Run on a NEW dedicated Neon project, never on HUQUQ ACADEMY database.
-- Create a distinct low-privilege application role for QOMUS.
-- These commands are intended for the DB administrator during provisioning.
BEGIN;
CREATE SCHEMA IF NOT EXISTS qomus_secure;
REVOKE ALL ON SCHEMA qomus_secure FROM PUBLIC;
CREATE TABLE IF NOT EXISTS qomus_secure.documents_v1 (
  owner_id text NOT NULL,
  record_id text NOT NULL,
  iv bytea NOT NULL CHECK (octet_length(iv)=12),
  auth_tag bytea NOT NULL CHECK (octet_length(auth_tag)=16),
  ciphertext bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id,record_id)
);
REVOKE ALL ON qomus_secure.documents_v1 FROM PUBLIC;
-- APPLICATION ROLE: provision a separate Neon role using the provider console,
-- then grant USAGE on the schema and SELECT/INSERT/UPDATE/DELETE on this table.
-- Do NOT provide credentials for the project owner or SUPERUSER to the app.
-- Ownership checks are enforced in the application with WHERE owner_id.
-- A DB role-per-user / verified RLS policy is required before high-assurance multi-tenancy.
COMMIT;
