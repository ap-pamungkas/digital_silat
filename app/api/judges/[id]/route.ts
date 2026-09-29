import { NextResponse } from "next/server";
import { updateJudgeAction, deleteJudgeAction } from "@/lib/data-service";
import { ConnectionStatus } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };
const connectionStatuses: ConnectionStatus[] = ["ONLINE", "SYNCING", "RECONNECTING", "OFFLINE"];

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const { name, licenseNumber, status, pingMs, batteryLevel } = body as {
      name?: string;
      licenseNumber?: string;
      status?: unknown;
      pingMs?: number;
      batteryLevel?: number;
    };

    if (status !== undefined && (typeof status !== "string" || !connectionStatuses.includes(status as ConnectionStatus))) {
      return NextResponse.json({ error: "Status juri tidak valid." }, { status: 400 });
    }

    const result = await updateJudgeAction(id, {
      name,
      licenseNumber,
      status: status as ConnectionStatus | undefined,
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
  { params }: RouteContext
) {
  try {
    const { id } = await params;
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
