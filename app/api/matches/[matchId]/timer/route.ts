import { NextResponse } from "next/server";
import { getMatchTimerAction, updateMatchTimerAction } from "@/lib/data-service";

type RouteContext = { params: Promise<{ matchId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { matchId } = await params;
    return NextResponse.json(await getMatchTimerAction(matchId));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengambil status timer.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { matchId } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("action" in body)) {
      return NextResponse.json({ error: "Aksi timer tidak valid." }, { status: 400 });
    }

    const { action, round } = body as { action: unknown; round?: unknown };
    if (!["START", "PAUSE", "RESET", "NEXT_ROUND", "SET_ROUND"].includes(String(action))) {
      return NextResponse.json({ error: "Aksi timer tidak valid." }, { status: 400 });
    }
    if (action === "SET_ROUND" && (typeof round !== "number" || !Number.isInteger(round))) {
      return NextResponse.json({ error: "Nomor babak tidak valid." }, { status: 400 });
    }

    const timer = await updateMatchTimerAction({
      matchId,
      action: action as "START" | "PAUSE" | "RESET" | "NEXT_ROUND" | "SET_ROUND",
      round: typeof round === "number" ? round : undefined,
    });
    return NextResponse.json(timer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui timer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}