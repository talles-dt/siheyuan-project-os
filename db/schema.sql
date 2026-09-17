-- Siheyuan Project OS — Neon schema (run once).
-- The canonical project state is stored as a single versioned JSON document.
-- This keeps the reducer intact and lets the app sync the whole state atomically.

CREATE TABLE IF NOT EXISTS project_state (
  id          TEXT PRIMARY KEY DEFAULT 'singleton',
  state       JSONB NOT NULL,
  versao      INTEGER NOT NULL DEFAULT 1,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO project_state (id, state, versao)
VALUES ('singleton', '{}'::jsonb, 1)
ON CONFLICT (id) DO NOTHING;

-- Audit trail for changes to immutable canonical principles.
CREATE TABLE IF NOT EXISTS principle_audit (
  id          BIGSERIAL PRIMARY KEY,
  principio_id TEXT NOT NULL,
  enunciado   TEXT NOT NULL,
  motivo      TEXT NOT NULL,
  autor       TEXT NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
