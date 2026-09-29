import { NextResponse } from "next/server";
import {
  deleteScheduledMatchAction,
  MatchScheduleInput,
  updateMatchScheduleAction,
} from "@/lib/data-service";

type RouteContext = { params: Promise<{ matchId: string }> };

const matchStages: MatchScheduleInput["stage"][] = [
  "PENYISIHAN",
  "PEREMPAT_FINAL",
  "SEMI_FINAL",
  "FINAL",
  "PEREBUTAN_JUARA_3",
];

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Data jadwal tidak valid." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    if (
      typeof data.arenaId !== "string" ||
      typeof data.matchNumber !== "string" ||
      typeof data.redAthleteId !== "string" ||
      typeof data.blueAthleteId !== "string" ||
      typeof data.scheduledDate !== "string" ||
      typeof data.scheduledTime !== "string" ||
      typeof data.stage !== "string" ||
      !matchStages.includes(data.stage as MatchScheduleInput["stage"])
    ) {
      return NextResponse.json({ error: "Data jadwal belum lengkap." }, { status: 400 });
    }

    const { matchId } = await params;
    const result = await updateMatchScheduleAction(matchId, {
      arenaId: data.arenaId,
      matchNumber: data.matchNumber,
      redAthleteId: data.redAthleteId,
      blueAthleteId: data.blueAthleteId,
      stage: data.stage as MatchScheduleInput["stage"],
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to update match schedule:", error);
    return NextResponse.json({ error: "Gagal memperbarui jadwal pertandingan." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { matchId } = await params;
  const result = await deleteScheduledMatchAction(matchId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}