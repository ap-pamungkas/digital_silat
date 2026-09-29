import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ tournamentId: string }> };

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { tournamentId } = await params;
    const result = await prisma.tournament.deleteMany({
      where: { code: tournamentId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { error: "Failed to delete tournament." },
      { status: 500 }
    );
  }
}