import { NextResponse } from "next/server";
import { decideScoreEventAction } from "@/lib/data-service";

type RouteContext = { params: Promise<{ matchId: string; eventId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { matchId, eventId } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("decision" in body)) {
      return NextResponse.json({ error: "Keputusan event tidak valid." }, { status: 400 });
    }

    const { decision } = body as { decision: unknown };
    if (decision !== "VERIFY" && decision !== "REJECT") {
      return NextResponse.json({ error: "Keputusan event tidak valid." }, { status: 400 });
    }

    return NextResponse.json(await decideScoreEventAction({ matchId, eventId, decision }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui event skor.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}