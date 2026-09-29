import { NextResponse } from "next/server";
import { getMatchScoringSnapshot, submitScoreEventAction } from "@/lib/data-service";
import { Corner, ScoringAction } from "@/lib/types";

type RouteContext = { params: Promise<{ matchId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { matchId } = await params;
    return NextResponse.json(await getMatchScoringSnapshot(matchId));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengambil log skor.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { matchId } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("corner" in body) || !("action" in body) || !("points" in body) || !("judgeNumber" in body)) {
      return NextResponse.json({ error: "Masukan skor tidak valid." }, { status: 400 });
    }

    const { corner, action, points, judgeNumber } = body as {
      corner: unknown;
      action: unknown;
      points: unknown;
      judgeNumber: unknown;
    };
    if ((corner !== "RED" && corner !== "BLUE") || typeof action !== "string" || typeof points !== "number" || typeof judgeNumber !== "number") {
      return NextResponse.json({ error: "Masukan skor tidak valid." }, { status: 400 });
    }

    const result = await submitScoreEventAction({
      matchId,
      corner: corner as Corner,
      action: action as ScoringAction,
      points,
      judgeNumber,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan masukan skor.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}