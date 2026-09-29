import { NextResponse } from "next/server";
import { deleteAthleteAction, updateAthleteAction } from "@/lib/data-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Data atlet tidak valid." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    if (
      typeof data.name !== "string" ||
      typeof data.contingent !== "string" ||
      typeof data.weightClass !== "string" ||
      (data.gender !== "PUTRA" && data.gender !== "PUTRI") ||
      (data.contingentCode !== undefined && typeof data.contingentCode !== "string")
    ) {
      return NextResponse.json({ error: "Data atlet tidak lengkap." }, { status: 400 });
    }

    const { id } = await params;
    const result = await updateAthleteAction(id, {
      name: data.name,
      contingentName: data.contingent,
      contingentCode: data.contingentCode,
      gender: data.gender,
      weightClassName: data.weightClass,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    console.error("Failed to update athlete:", error);
    return NextResponse.json({ error: "Gagal memperbarui data atlet." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const result = await deleteAthleteAction(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}