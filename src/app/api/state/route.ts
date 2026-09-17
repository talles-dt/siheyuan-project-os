import { NextResponse } from "next/server";
import { emptyState } from "@/domain/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = emptyState();
  return NextResponse.json({
    versao: snapshot.versao,
    principios: snapshot.principios.length,
    etapas: snapshot.etapas.length,
    programaAreas: snapshot.programaAreas.length,
    pranchas: snapshot.pranchas.length,
    riscos: snapshot.riscos.length,
    timestamp: new Date().toISOString(),
  });
}
