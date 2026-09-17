import { NextResponse } from "next/server";
import { emptyState, parseBackup } from "@/domain/store";
import { fetchState, putState, hasDatabase } from "@/domain/db";
import type { SiheyuanState } from "@/domain/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const seed = emptyState();
  if (hasDatabase()) {
    const remote = await fetchState();
    if (remote) {
      return NextResponse.json({
        state: remote,
        source: "neon",
        timestamp: new Date().toISOString(),
      });
    }
  }
  return NextResponse.json({
    state: seed,
    source: hasDatabase() ? "neon-empty" : "seed",
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(req: Request) {
  const raw = await req.text();
  let state: SiheyuanState;
  try {
    state = parseBackup(raw);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Estado inválido." },
      { status: 400 }
    );
  }
  const ok = await putState(state);
  return NextResponse.json(
    { ok, source: ok ? "neon" : "local", timestamp: new Date().toISOString() },
    { status: ok ? 200 : 502 }
  );
}
