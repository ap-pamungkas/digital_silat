import { NextResponse } from "next/server";
import { createJudgeAction, getJudges } from "@/lib/data-service";

export async function GET() {
  try {
    const list = await getJudges();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch judges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("arenaId" in body) || !("judgeNumber" in body) || !("name" in body)) {
      return NextResponse.json({ error: "Data juri tidak valid." }, { status: 400 });
    }

    const { arenaId, judgeNumber, name, licenseNumber } = body as {
      arenaId: unknown;
      judgeNumber: unknown;
      name: unknown;
      licenseNumber?: unknown;
    };
    if (typeof arenaId !== "string" || typeof judgeNumber !== "number" || typeof name !== "string" || (licenseNumber !== undefined && typeof licenseNumber !== "string")) {
      return NextResponse.json({ error: "Data juri tidak valid." }, { status: 400 });
    }

    const result = await createJudgeAction({
      arenaId,
      judgeNumber,
      name,
      licenseNumber,
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result.data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mendaftarkan juri.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
