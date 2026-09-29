import { NextResponse } from "next/server";
import { getMatches, createMatchAction, updateMatchStatusAction } from "@/lib/data-service";
import { MatchWinReason } from "@/lib/types";

const matchStatuses = ["SCHEDULED", "READY", "LIVE", "PAUSED", "FINISHED", "CANCELLED"] as const;
const matchWinReasons: MatchWinReason[] = [
  "MENANG_ANGKA",
  "MENANG_MUTLAK",
  "MENANG_TEKNIK",
  "MENANG_DISKUALIFIKASI",
  "MENANG_W_O",
  "MENANG_UNDUR_DIRI",
];

export async function GET() {
  try {
    const list = await getMatches();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createMatchAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create match" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Data status pertandingan tidak valid." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    if (
      typeof data.matchId !== "string" ||
      typeof data.status !== "string" ||
      !matchStatuses.includes(data.status as (typeof matchStatuses)[number]) ||
      (data.winnerCorner !== undefined && data.winnerCorner !== "RED" && data.winnerCorner !== "BLUE") ||
      (data.winReason !== undefined && !matchWinReasons.includes(data.winReason as MatchWinReason))
    ) {
      return NextResponse.json({ error: "Data status pertandingan tidak valid." }, { status: 400 });
    }

    const result = await updateMatchStatusAction({
      matchId: data.matchId,
      status: data.status as (typeof matchStatuses)[number],
      winnerCorner: data.winnerCorner as "RED" | "BLUE" | undefined,
      winReason: data.winReason as MatchWinReason | undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update match" },
      { status: 500 }
    );
  }
}
