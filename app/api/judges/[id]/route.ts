import { NextResponse } from "next/server";
import { updateJudgeAction, deleteJudgeAction } from "@/lib/data-service";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: unknown = await request.json();
    
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const { name, licenseNumber, status, pingMs, batteryLevel } = body as {
      name?: string;
      licenseNumber?: string;
      status?: string;
      pingMs?: number;
      batteryLevel?: number;
    };

    const result = await updateJudgeAction(id, {
      name,
      licenseNumber,
      status,
      pingMs,
      batteryLevel,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengupdate juri.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const result = await deleteJudgeAction(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus juri.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
