import { neon } from "@neondatabase/serverless";
import type { SiheyuanState } from "./types";

let sql: ReturnType<typeof neon> | null = null;

function getSql(): ReturnType<typeof neon> | null {
  if (sql) return sql;
  if (typeof process === "undefined") return null;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  sql = neon(url);
  return sql;
}

export function hasDatabase(): boolean {
  return getSql() !== null;
}

export async function fetchState(): Promise<SiheyuanState | null> {
  const db = getSql();
  if (!db) return null;
  try {
    const rows = (await db`SELECT state FROM project_state WHERE id = 'singleton'`) as Array<{
      state: SiheyuanState;
    }>;
    if (rows.length === 0) return null;
    const state = rows[0].state as SiheyuanState;
    if (!state || !Array.isArray(state.principios) || state.principios.length === 0) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export async function putState(state: SiheyuanState): Promise<boolean> {
  const db = getSql();
  if (!db) return false;
  try {
    await db`
      INSERT INTO project_state (id, state, versao, updated_at)
      VALUES ('singleton', ${JSON.stringify(state)}::jsonb, ${state.versao}, now())
      ON CONFLICT (id) DO UPDATE
        SET state = EXCLUDED.state,
            versao = EXCLUDED.versao,
            updated_at = EXCLUDED.updated_at
    `;
    return true;
  } catch {
    return false;
  }
}

export async function recordPrincipleAudit(entry: {
  principioId: string;
  enunciado: string;
  motivo: string;
  autor: string;
}): Promise<boolean> {
  const db = getSql();
  if (!db) return false;
  try {
    await db`
      INSERT INTO principle_audit (principio_id, enunciado, motivo, autor)
      VALUES (${entry.principioId}, ${entry.enunciado}, ${entry.motivo}, ${entry.autor})
    `;
    return true;
  } catch {
    return false;
  }
}
